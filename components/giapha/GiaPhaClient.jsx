"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

import FamilyTreeView from "./FamilyTreeView";
import TimelineView from "./TimelineView";
import ChronicleView from "./ChronicleView";
import PersonDetailModal from "./PersonDetailModal";

const EMPTY_TREE = {
  persons: [],
  generations: [],
  timeline: [],
  chronicle: "",
};

export default function GiaPhaClient({ initialTrees = [], initialTreeId }) {
  const { lang, t } = useI18n();

  const activeTreeId = initialTreeId || initialTrees[0]?.id || "doan-toc";
  const [activeTab, setActiveTab] = useState("tree"); // "tree" | "timeline" | "chronicle"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState(null);
  const [rootPersonId, setRootPersonId] = useState(null);

  const currentTree = useMemo(() => {
    return initialTrees.find((t) => t.id === activeTreeId) || initialTrees[0] || EMPTY_TREE;
  }, [initialTrees, activeTreeId]);

  const rootPerson = useMemo(() => {
    return rootPersonId ? (currentTree.persons || []).find((p) => p.id === rootPersonId) : null;
  }, [currentTree.persons, rootPersonId]);

  const treeTitle =
    lang === "en" && currentTree.titleEn ? currentTree.titleEn : currentTree.title;

  const handleLocateInTree = (person) => {
    setActiveTab("tree");
    setHighlightedPersonId(person.id);
  };

  return (
    <div className="giapha-page-container">
      {/* Top Header & Tree Switcher */}
      <div className="giapha-top-header">
        <div className="giapha-title-area">
          <h1 className="giapha-page-title">{treeTitle}</h1>
          {currentTree.branch && (
            <p className="giapha-page-subtitle">{currentTree.branch}</p>
          )}
        </div>

        {/* Clean Tree Switcher Pills */}
        {initialTrees.length > 1 && (
          <div className="giapha-tree-switcher">
            <span className="giapha-switcher-label">
              <i className="bi bi-diagram-2" />
              {t("giapha.selectTree")}:
            </span>
            <div className="giapha-switcher-pills">
              {initialTrees.map((tr) => (
                <Link
                  key={tr.id}
                  href={`/tree/${tr.id}`}
                  className={`giapha-switcher-pill ${
                    tr.id === activeTreeId ? "is-active" : ""
                  }`}
                >
                  {lang === "en" && tr.titleEn ? tr.titleEn : tr.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Controls Bar: Tabs & Search */}
      <div className="giapha-controls-bar">
        {/* Navigation Tabs */}
        <div className="giapha-view-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tree"}
            className={`giapha-tab-btn ${activeTab === "tree" ? "active" : ""}`}
            onClick={() => setActiveTab("tree")}
          >
            <i className="bi bi-diagram-3" />
            <span>{t("giapha.treeView")}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "timeline"}
            className={`giapha-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <i className="bi bi-folder2-open" />
            <span>{lang === "en" ? "Members by Generation" : "Thành Viên Theo Đời"}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "chronicle"}
            className={`giapha-tab-btn ${activeTab === "chronicle" ? "active" : ""}`}
            onClick={() => setActiveTab("chronicle")}
          >
            <i className="bi bi-journal-text" />
            <span>{t("giapha.chronicleView")}</span>
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="giapha-search-wrap">
          <i className="bi bi-search giapha-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="giapha-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("giapha.searchPlaceholder")}
          />
          {searchQuery && (
            <button
              type="button"
              className="giapha-search-clear"
              onClick={() => setSearchQuery("")}
              title={t("giapha.clearFilter")}
            >
              <i className="bi bi-x" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Content */}
      <main className="giapha-main-viewport">
        {activeTab === "tree" && (
          <FamilyTreeView
            tree={currentTree}
            searchQuery={searchQuery}
            onSelectPerson={(person) => setSelectedPerson(person)}
            highlightedPersonId={highlightedPersonId}
            rootPersonId={rootPersonId}
            onClearRoot={() => setRootPersonId(null)}
          />
        )}

        {activeTab === "timeline" && (
          <TimelineView
            tree={currentTree}
            searchQuery={searchQuery}
            onSelectPerson={(person) => setSelectedPerson(person)}
            rootPersonId={rootPersonId}
            onClearRoot={() => setRootPersonId(null)}
          />
        )}

        {activeTab === "chronicle" && (
          <ChronicleView
            tree={currentTree}
          />
        )}
      </main>

      {/* Person Detail Inspector Modal */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          allPersons={currentTree.persons || []}
          isRoot={rootPersonId === selectedPerson.id}
          onClose={() => setSelectedPerson(null)}
          onSelectPerson={(rel) => setSelectedPerson(rel)}
          onLocateInTree={(p) => {
            setSelectedPerson(null);
            handleLocateInTree(p);
          }}
          onMakeRoot={(p) => {
            setRootPersonId(p.id);
            setHighlightedPersonId(p.id);
            setSelectedPerson(null);
            setActiveTab("tree");
          }}
          onClearRoot={() => {
            setRootPersonId(null);
            setSelectedPerson(null);
          }}
        />
      )}
    </div>
  );
}
