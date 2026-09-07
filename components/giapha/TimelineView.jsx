"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";
import { formatPersonDate } from "./PersonCard";

function personMatches(person, query) {
  if (!query) return true;
  return [
    person.display_name,
    person.first_name,
    person.last_name,
    person.occupation,
    person.birth_place,
    person.biography,
    person.category,
  ].some((value) => value?.toLowerCase().includes(query));
}

function buildFamilyFolders(persons) {
  const byId = new Map(persons.map((person) => [person.id, person]));
  const unionParent = new Map(persons.map((person) => [person.id, person.id]));

  const find = (id) => {
    let root = unionParent.get(id);
    while (root !== unionParent.get(root)) root = unionParent.get(root);
    let current = id;
    while (current !== root) {
      const next = unionParent.get(current);
      unionParent.set(current, root);
      current = next;
    }
    return root;
  };

  const union = (left, right) => {
    if (!unionParent.has(left) || !unionParent.has(right)) return;
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) unionParent.set(rightRoot, leftRoot);
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
  components.forEach((members) => {
    members.sort((left, right) => {
      const leftLinks = (left.parent_ids || []).length + (left.children_ids || []).length;
      const rightLinks = (right.parent_ids || []).length + (right.children_ids || []).length;
      return rightLinks - leftLinks;
    });
    const key = members[0].id;
    members.forEach((member) => personToFamily.set(member.id, key));
    families.push({
      key,
      members,
      generation: Math.min(...members.map((member) => Number(member.generation) || 1)),
      children: [],
    });
  });

  const familyByKey = new Map(families.map((family) => [family.key, family]));
  const roots = [];
  families.forEach((family) => {
    const parentId = family.members
      .flatMap((member) => member.parent_ids || [])
      .find((id) => byId.has(id) && personToFamily.get(id) !== family.key);
    const parentFamily = parentId ? familyByKey.get(personToFamily.get(parentId)) : null;
    if (parentFamily) parentFamily.children.push(family);
    else roots.push(family);
  });

  const sortFamilies = (items) => {
    items.sort((left, right) =>
      left.generation - right.generation ||
      (left.members[0].display_name || "").localeCompare(right.members[0].display_name || "", "vi")
    );
    items.forEach((item) => sortFamilies(item.children));
  };
  sortFamilies(roots);
  return roots;
}

function FolderMember({ person, onSelectPerson }) {
  const { t } = useI18n();
  const birth = formatPersonDate(person.birth_date, person.birth_date_precision);
  const death = formatPersonDate(person.death_date, person.death_date_precision, true);
  const dates = birth && death ? `${birth} – ${death}` : birth || (death ? `† ${death}` : "");

  return (
    <button
      type="button"
      className="giapha-folder-person"
      onClick={() => onSelectPerson?.(person)}
    >
      <span className={`giapha-folder-avatar ${person.gender || "unknown"}`}>
        <i className={`bi ${person.gender === "female" ? "bi-gender-female" : person.gender === "male" ? "bi-gender-male" : "bi-person-fill"}`} />
      </span>
      <span className="giapha-folder-person-copy">
        <span className="giapha-folder-person-name">
          {person.display_name || person.first_name}
        </span>
        <span className="giapha-folder-person-meta">
          {t("giapha.generation", { gen: person.generation || 1 })}
          {person.category ? ` · ${person.category}` : ""}
        </span>
      </span>
      {dates && <span className="giapha-folder-dates">{dates}</span>}
    </button>
  );
}

function FolderNode({ family, query, collapsed, onToggle, onSelectPerson }) {
  const ownMatch = family.members.some((person) => personMatches(person, query));
  const visibleChildren = family.children
    .map((child) => ({ child, visible: familyHasMatch(child, query) }))
    .filter(({ visible }) => visible)
    .map(({ child }) => child);
  const visible = ownMatch || visibleChildren.length > 0;
  if (!visible) return null;

  const hasChildren = visibleChildren.length > 0;
  const isOpen = Boolean(query) || !collapsed.has(family.key);

  return (
    <li className="giapha-folder-node">
      <div className="giapha-folder-row">
        <span className="giapha-folder-generation-index" title={`Generation ${family.generation}`}>
          {family.generation}
        </span>
        <button
          type="button"
          className="giapha-folder-toggle"
          onClick={() => hasChildren && onToggle(family.key)}
          aria-expanded={hasChildren ? isOpen : undefined}
          disabled={!hasChildren}
        >
          <i className={`bi ${hasChildren && isOpen ? "bi-folder2-open" : "bi-folder2"}`} />
          {hasChildren && <i className={`bi bi-chevron-${isOpen ? "down" : "right"} giapha-folder-chevron`} />}
        </button>
        <div className="giapha-folder-members">
          {family.members.map((person, index) => (
            <span key={person.id} className="giapha-folder-member-wrap">
              {index > 0 && <i className="bi bi-heart-fill giapha-folder-spouse" aria-label="Spouse" />}
              <FolderMember person={person} onSelectPerson={onSelectPerson} />
            </span>
          ))}
        </div>
      </div>
      {hasChildren && isOpen && (
        <ul className="giapha-folder-children">
          {visibleChildren.map((child) => (
            <FolderNode
              key={child.key}
              family={child}
              query={query}
              collapsed={collapsed}
              onToggle={onToggle}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function familyHasMatch(family, query) {
  if (!query) return true;
  return family.members.some((person) => personMatches(person, query)) ||
    family.children.some((child) => familyHasMatch(child, query));
}

function findRootFolder(families, personId) {
  for (const family of families) {
    if (family.members.some((member) => member.id === personId)) return family;
    const nested = findRootFolder(family.children, personId);
    if (nested) return nested;
  }
  return null;
}

export default function TimelineView({
  tree = {},
  searchQuery = "",
  onSelectPerson,
  rootPersonId = null,
  onClearRoot,
}) {
  const { lang, t } = useI18n();
  const [collapsed, setCollapsed] = useState(() => new Set());
  const rootPerson = useMemo(() => {
    return rootPersonId ? (tree.persons || []).find((p) => p.id === rootPersonId) : null;
  }, [tree.persons, rootPersonId]);
  const folders = useMemo(() => buildFamilyFolders(tree.persons || []), [tree.persons]);
  const visibleFolders = useMemo(() => {
    if (!rootPersonId) return folders;
    const selectedRoot = findRootFolder(folders, rootPersonId);
    return selectedRoot ? [selectedRoot] : folders;
  }, [folders, rootPersonId]);
  const query = searchQuery.trim().toLowerCase();
  const hasResults = visibleFolders.some((family) => familyHasMatch(family, query));

  const toggle = (key) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!hasResults) {
    return (
      <div className="giapha-empty-state">
        <p>{t("giapha.noData")}</p>
        {rootPerson && onClearRoot && (
          <Button
            variant="outline"
            size="sm"
            icon="bi-arrow-counterclockwise"
            style={{ marginTop: "1rem" }}
            onClick={onClearRoot}
          >
            {t("giapha.resetRoot") || (lang === "en" ? "Show full tree" : "Xem toàn bộ cây")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="giapha-folder-tree-container">
      {/* Root banner if filtered by root */}
      {rootPerson && onClearRoot && (
        <div className="cruz-root-hud inline-hud">
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

      <div className="giapha-folder-tree">
        <ul className="giapha-folder-roots">
          {visibleFolders.map((family) => (
            <FolderNode
              key={family.key}
              family={family}
              query={query}
              collapsed={collapsed}
              onToggle={toggle}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
