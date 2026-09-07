"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { formatPersonDate } from "./PersonCard";

const MIN_SCALE = 0.08;
const MAX_SCALE = 2;

function lifeSpan(person) {
  const birth = formatPersonDate(person.birth_date, person.birth_date_precision);
  const death = formatPersonDate(person.death_date, person.death_date_precision, true);
  if (birth && death) return `${birth} – ${death}`;
  return birth || (death ? `† ${death}` : "");
}

function matches(person, query) {
  if (!query) return false;
  return [person.display_name, person.first_name, person.last_name, person.occupation, person.category]
    .some((value) => value?.toLowerCase().includes(query));
}

// A GoJS TreeModel has one visual node per family unit. Spouses are grouped into
// that unit so their children descend from the couple, while every person remains
// individually clickable and searchable.
function buildFamilyModel(persons) {
  const byId = new Map(persons.map((person) => [person.id, person]));
  const parent = new Map(persons.map((person) => [person.id, person.id]));

  const find = (id) => {
    let root = parent.get(id);
    while (root !== parent.get(root)) root = parent.get(root);
    let current = id;
    while (current !== root) {
      const next = parent.get(current);
      parent.set(current, root);
      current = next;
    }
    return root;
  };
  const union = (left, right) => {
    if (!parent.has(left) || !parent.has(right)) return;
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };

  persons.forEach((person) => {
    (person.spouse_ids || []).forEach((spouseId) => union(person.id, spouseId));
  });

  const components = new Map();
  persons.forEach((person) => {
    const root = find(person.id);
    if (!components.has(root)) components.set(root, []);
    components.get(root).push(person);
  });

  const personToFamily = new Map();
  const families = [];
  components.forEach((component) => {
    component.sort((a, b) => {
      const aLineage = (a.children_ids || []).length + (a.parent_ids || []).length;
      const bLineage = (b.children_ids || []).length + (b.parent_ids || []).length;
      return bLineage - aLineage;
    });
    const key = component[0].id;
    component.forEach((person) => personToFamily.set(person.id, key));
    families.push({ key, component });
  });

  const nodes = families.map(({ key, component }) => {
    const parentId = component
      .flatMap((person) => person.parent_ids || [])
      .find((id) => byId.has(id) && personToFamily.get(id) !== key);
    const parentKey = parentId ? personToFamily.get(parentId) : undefined;

    return {
      key,
      parent: parentKey,
      members: component.map((person, index) => ({
        person,
        id: person.id,
        name: person.display_name || person.first_name || "?",
        details: lifeSpan(person),
        avatar: person.avatar_url || "",
        placeholderIcon: person.gender === "female" ? "\uf642" :
          person.gender === "male" ? "\uf643" : "\uf4da",
        gender: person.gender,
        generation: person.generation || 1,
        showHeart: index > 0,
        isHighlighted: false,
      })),
      isHighlighted: false,
    };
  });

  const rootKey = nodes.find((node) => !node.parent)?.key;
  return { nodes, personToFamily, rootKey };
}

export default function FamilyTreeView({
  tree = {},
  searchQuery = "",
  onSelectPerson,
  highlightedPersonId = null,
  rootPersonId = null,
  onClearRoot,
}) {
  const { lang, t } = useI18n();
  const boardRef = useRef(null);
  const hostRef = useRef(null);
  const diagramRef = useRef(null);
  const selectPersonRef = useRef(onSelectPerson);
  const focusPersonRef = useRef(null);
  const activePersonIdsRef = useRef(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(85);
  selectPersonRef.current = onSelectPerson;

  const persons = useMemo(() => tree.persons || [], [tree.persons]);
  const familyModel = useMemo(() => buildFamilyModel(persons), [persons]);
  const displayedModel = useMemo(() => {
    const selectedRootKey = rootPersonId
      ? familyModel.personToFamily.get(rootPersonId)
      : familyModel.rootKey;
    if (!selectedRootKey || !rootPersonId) {
      return { nodes: familyModel.nodes, rootKey: familyModel.rootKey };
    }

    const included = new Set([selectedRootKey]);
    let changed = true;
    while (changed) {
      changed = false;
      familyModel.nodes.forEach((node) => {
        if (included.has(node.parent) && !included.has(node.key)) {
          included.add(node.key);
          changed = true;
        }
      });
    }

    return {
      rootKey: selectedRootKey,
      nodes: familyModel.nodes
        .filter((node) => included.has(node.key))
        .map((node) => node.key === selectedRootKey ? { ...node, parent: undefined } : node),
    };
  }, [familyModel, rootPersonId]);
  const query = searchQuery.trim().toLowerCase();
  const matchesById = useMemo(
    () => new Set(persons.filter((person) => matches(person, query)).map((person) => person.id)),
    [persons, query]
  );
  const rootPerson = useMemo(() => {
    return rootPersonId ? persons.find((person) => person.id === rootPersonId) : null;
  }, [persons, rootPersonId]);
  const focusPersonId = highlightedPersonId ||
    (matchesById.size === 1 ? [...matchesById][0] : null);
  focusPersonRef.current = focusPersonId;
  activePersonIdsRef.current = new Set([
    ...matchesById,
    ...(highlightedPersonId ? [highlightedPersonId] : []),
  ]);

  const focusFamily = useCallback((personId, scale = 0.9) => {
    const diagram = diagramRef.current;
    const familyKey = familyModel.personToFamily.get(personId);
    const node = familyKey ? diagram?.findNodeForKey(familyKey) : null;
    if (!diagram || !node) return false;
    diagram.scale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
    diagram.select(node);
    diagram.centerRect(node.actualBounds);
    return true;
  }, [familyModel.personToFamily]);

  const centerOnRoot = useCallback(() => {
    const diagram = diagramRef.current;
    const node = diagram?.findNodeForKey(displayedModel.rootKey);
    if (!diagram || !node) return;
    diagram.scale = 0.85;
    diagram.select(node);
    diagram.centerRect(node.actualBounds);
  }, [displayedModel.rootKey]);

  useEffect(() => {
    let disposed = false;
    let diagram;

    import("gojs").then((go) => {
      if (disposed || !hostRef.current) return;
      const $ = go.GraphObject.make;
      const css = getComputedStyle(document.documentElement);
      const surface = css.getPropertyValue("--surface").trim() || "#fff";
      const text = css.getPropertyValue("--text").trim() || "#333";
      const muted = css.getPropertyValue("--text-muted").trim() || "#657b83";
      const border = css.getPropertyValue("--border").trim() || "#d5d0c4";
      const blue = css.getPropertyValue("--blue").trim() || "#268bd2";

      const memberTemplate = $(
        go.Panel,
        "Horizontal",
        {
          margin: 6,
          cursor: "pointer",
          click: (_event, panel) => selectPersonRef.current?.(panel.data.person),
        },
        $(
          go.TextBlock,
          "♥",
          { margin: new go.Margin(0, 8, 0, 0), stroke: "#d33682", font: "700 14px sans-serif" },
          new go.Binding("visible", "showHeart")
        ),
        $(
          go.Panel,
          "Vertical",
          { width: 126, defaultAlignment: go.Spot.Center },
          $(
            go.Panel,
            "Auto",
            $(
              go.Shape,
              "Circle",
              { width: 54, height: 54, strokeWidth: 3, fill: blue },
              new go.Binding("fill", "gender", (gender) => gender === "female" ? "#d33682" : blue),
              new go.Binding("stroke", "isHighlighted", (active) => active ? "#f6c945" : surface),
              new go.Binding("strokeWidth", "isHighlighted", (active) => active ? 5 : 3)
            ),
            $(
              go.TextBlock,
              { stroke: "#fff", font: "26px bootstrap-icons" },
              new go.Binding("text", "placeholderIcon"),
              new go.Binding("visible", "avatar", (avatar) => !avatar)
            ),
            $(
              go.Panel,
              "Spot",
              { isClipping: true },
              $(go.Shape, "Circle", { width: 48, height: 48, stroke: null }),
              $(
                go.Picture,
                { width: 48, height: 48, imageStretch: go.ImageStretch.UniformToFill },
                new go.Binding("source", "avatar")
              ),
              new go.Binding("visible", "avatar", Boolean)
            )
          ),
          $(
            go.TextBlock,
            {
              margin: new go.Margin(5, 0, 0, 0),
              stroke: text,
              font: "700 11px system-ui, sans-serif",
              width: 120,
              maxLines: 2,
              textAlign: "center",
              wrap: go.Wrap.Fit,
              overflow: go.TextOverflow.Ellipsis,
            },
            new go.Binding("text", "name")
          ),
          $(
            go.TextBlock,
            { margin: new go.Margin(2, 0, 0, 0), stroke: muted, font: "500 8.5px system-ui, sans-serif" },
            new go.Binding("text", "details"),
            new go.Binding("visible", "details", Boolean)
          ),
          $(
            go.TextBlock,
            { margin: new go.Margin(2, 0, 0, 0), stroke: blue, font: "600 8.5px system-ui, sans-serif" },
            new go.Binding("text", "generation", (generation) =>
              lang === "en" ? `Generation ${generation}` : `Đời ${generation}`
            )
          )
        )
      );

      diagram = $(go.Diagram, hostRef.current, {
        padding: new go.Margin(60, 80, 60, 80),
        minScale: MIN_SCALE,
        maxScale: MAX_SCALE,
        allowCopy: false,
        allowDelete: false,
        allowInsert: false,
        allowLink: false,
        allowMove: false,
        "toolManager.mouseWheelBehavior": go.WheelMode.Zoom,
        layout: $(go.TreeLayout, {
          angle: 90,
          layerSpacing: 82,
          nodeSpacing: 24,
          alignment: go.TreeAlignment.CenterChildren,
          compaction: go.TreeCompaction.Block,
        }),
      });

      diagram.nodeTemplate = $(
        go.Node,
        "Auto",
        {
          selectionAdorned: false,
          isShadowed: true,
          shadowColor: "rgba(0,0,0,.14)",
          shadowBlur: 8,
          shadowOffset: new go.Point(0, 3),
        },
        $(
          go.Shape,
          "RoundedRectangle",
          {
            fill: surface,
            stroke: border,
            strokeWidth: 1.5,
            parameter1: 12,
          },
          new go.Binding("stroke", "isHighlighted", (active) => active ? blue : border),
          new go.Binding("strokeWidth", "isHighlighted", (active) => active ? 3 : 1.5)
        ),
        $(
          go.Panel,
          "Horizontal",
          { itemTemplate: memberTemplate },
          new go.Binding("itemArray", "members")
        )
      );

      diagram.linkTemplate = $(
        go.Link,
        { routing: go.Routing.Orthogonal, corner: 8, selectable: false, layerName: "Background" },
        $(go.Shape, { stroke: muted, strokeWidth: 1.8 })
      );

      diagram.addDiagramListener("ViewportBoundsChanged", () => {
        setZoomPercent(Math.round(diagram.scale * 100));
      });
      diagram.addDiagramListener("InitialLayoutCompleted", () => {
        if (!focusFamily(focusPersonRef.current)) centerOnRoot();
      });
      diagramRef.current = diagram;
      const initialNodes = displayedModel.nodes.map((family) => {
        const members = family.members.map((member) => ({
          ...member,
          isHighlighted: activePersonIdsRef.current.has(member.id),
        }));
        return {
          ...family,
          members,
          isHighlighted: members.some((member) => member.isHighlighted),
        };
      });
      diagram.model = new go.TreeModel(initialNodes);
    });

    return () => {
      disposed = true;
      if (diagram) diagram.div = null;
      if (diagramRef.current === diagram) diagramRef.current = null;
    };
  }, [centerOnRoot, displayedModel.nodes, focusFamily, lang]);

  useEffect(() => {
    const diagram = diagramRef.current;
    if (!diagram) return;
    diagram.model.commit((model) => {
      model.nodeDataArray.forEach((family) => {
        const familyActive = family.members.some((member) =>
          member.id === highlightedPersonId || matchesById.has(member.id)
        );
        model.set(family, "isHighlighted", familyActive);
        family.members.forEach((member) => {
          model.set(member, "isHighlighted",
            member.id === highlightedPersonId || matchesById.has(member.id));
        });
      });
    }, "highlight people");
    if (focusPersonId) focusFamily(focusPersonId);
  }, [focusFamily, focusPersonId, highlightedPersonId, matchesById]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === boardRef.current);
      requestAnimationFrame(() => diagramRef.current?.requestUpdate());
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const fit = () => diagramRef.current?.commandHandler.zoomToFit();
  const zoom = (factor) => diagramRef.current?.commandHandler.increaseZoom(factor);
  const toggleFullscreen = () => {
    if (!boardRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else boardRef.current.requestFullscreen?.();
  };

  return (
    <div className="giapha-tree-section">
      <div ref={boardRef} className={`cruz-tree-board ${isFullscreen ? "is-fullscreen" : ""}`}>
        {/* Top-Left Root Lineage HUD Panel (Matches cruz-zoom-panel) */}
        {rootPerson && (
          <div className="cruz-root-hud">
            <span className="cruz-root-hud-icon">
              <i className="bi bi-diagram-3" />
            </span>
            <span className="cruz-root-hud-label">
              {t("giapha.viewingBranch") || (lang === "en" ? "Branch of:" : "Đang xem nhánh của:")}
            </span>
            <strong className="cruz-root-hud-name">
              {rootPerson.display_name || rootPerson.first_name}
            </strong>
            {rootPerson.generation && (
              <span className="cruz-root-hud-gen">
                ({t("giapha.generation", { gen: rootPerson.generation })})
              </span>
            )}
            <Button
              variant="outline"
              size="xs"
              icon="bi-arrow-counterclockwise"
              onClick={onClearRoot}
              title={t("giapha.resetToFullTree") || (lang === "en" ? "Show full tree" : "Xem toàn bộ cây")}
            >
              {t("giapha.resetRoot") || (lang === "en" ? "Show full tree" : "Xem toàn bộ cây")}
            </Button>
          </div>
        )}

        <div
          ref={hostRef}
          className="gojs-family-canvas"
          role="application"
          aria-label={lang === "en" ? "Interactive family tree" : "Cây gia phả tương tác"}
        />
        <div className="cruz-zoom-panel">
          <button type="button" className="cruz-zoom-btn" onClick={fit} title="Fit entire tree"><i className="bi bi-aspect-ratio" /></button>
          <button type="button" className="cruz-zoom-btn" onClick={() => zoom(1.1)} title={t("giapha.zoomIn")}><i className="bi bi-zoom-in" /></button>
          <span className="cruz-zoom-value">{zoomPercent}%</span>
          <button type="button" className="cruz-zoom-btn" onClick={() => zoom(0.9)} title={t("giapha.zoomOut")}><i className="bi bi-zoom-out" /></button>
          <button
            type="button"
            className={`cruz-zoom-btn ${rootPersonId ? "is-root-active" : ""}`}
            onClick={rootPersonId ? onClearRoot : centerOnRoot}
            title={rootPersonId ? (t("giapha.resetToFullTree") || (lang === "en" ? "Show full tree" : "Xem toàn bộ cây")) : (t("giapha.centerRoot") || (lang === "en" ? "Center on root" : "Căn giữa gốc"))}
          >
            <i className="bi bi-arrow-counterclockwise" />
          </button>
          <button type="button" className="cruz-zoom-btn" onClick={toggleFullscreen} title={isFullscreen ? t("giapha.exitFullscreen") : t("giapha.fullscreen")}><i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-arrows-fullscreen"}`} /></button>
        </div>
      </div>
    </div>
  );
}
