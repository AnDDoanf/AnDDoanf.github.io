"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import PersonCard from "./PersonCard";

export default function DirectoryView({
  tree = {},
  searchQuery = "",
  onSelectPerson,
}) {
  const { t } = useI18n();

  const [selectedGen, setSelectedGen] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedLiving, setSelectedLiving] = useState("all");
  const [sortBy, setSortBy] = useState("generation-asc");

  const persons = useMemo(() => tree.persons || [], [tree]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    persons.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [persons]);

  // Filtered persons
  const filteredPersons = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();

    return persons.filter((p) => {
      // Search
      if (q) {
        const matchesName =
          p.display_name?.toLowerCase().includes(q) ||
          p.first_name?.toLowerCase().includes(q) ||
          p.last_name?.toLowerCase().includes(q);
        const matchesOcc = p.occupation?.toLowerCase().includes(q);
        const matchesPlace = p.birth_place?.toLowerCase().includes(q);
        const matchesBio = p.biography?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesOcc && !matchesPlace && !matchesBio && !matchesCategory) {
          return false;
        }
      }

      // Generation
      if (selectedGen !== "all" && p.generation !== Number(selectedGen)) {
        return false;
      }

      // Category
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }

      // Gender
      if (selectedGender !== "all" && p.gender !== selectedGender) {
        return false;
      }

      // Living
      if (selectedLiving === "living" && !p.is_living) return false;
      if (selectedLiving === "deceased" && p.is_living) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "generation-asc") return a.generation - b.generation;
      if (sortBy === "generation-desc") return b.generation - a.generation;
      if (sortBy === "name-asc") return a.first_name.localeCompare(b.first_name, "vi");
      if (sortBy === "name-desc") return b.first_name.localeCompare(a.first_name, "vi");
      return 0;
    });
  }, [persons, searchQuery, selectedGen, selectedCategory, selectedGender, selectedLiving, sortBy]);

  return (
    <div className="giapha-directory-container">
      {/* Filter Toolbar */}
      <div className="giapha-filter-bar">
        {/* Generation Filter */}
        <div className="giapha-filter-group">
          <label className="giapha-filter-label">{t("giapha.filterGeneration")}:</label>
          <select
            className="giapha-select"
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
          >
            <option value="all">{t("giapha.filterAll")}</option>
            {tree.generations?.map((gen) => (
              <option key={gen} value={gen}>
                {t("giapha.generation", { gen })}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="giapha-filter-group">
            <label className="giapha-filter-label">{t("giapha.filterBranch")}:</label>
            <select
              className="giapha-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t("giapha.filterAll")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Gender Filter */}
        <div className="giapha-filter-group">
          <label className="giapha-filter-label">{t("giapha.filterGender")}:</label>
          <select
            className="giapha-select"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">{t("giapha.filterAll")}</option>
            <option value="male">{t("giapha.male")}</option>
            <option value="female">{t("giapha.female")}</option>
          </select>
        </div>

        {/* Living / Deceased Filter */}
        <div className="giapha-filter-group">
          <label className="giapha-filter-label">{t("giapha.filterStatus")}:</label>
          <select
            className="giapha-select"
            value={selectedLiving}
            onChange={(e) => setSelectedLiving(e.target.value)}
          >
            <option value="all">{t("giapha.filterAll")}</option>
            <option value="living">{t("giapha.living")}</option>
            <option value="deceased">{t("giapha.deceased")}</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="giapha-results-count">
        {filteredPersons.length} / {persons.length} {t("giapha.totalMembers").toLowerCase()}
      </div>

      {/* Cards Grid */}
      {filteredPersons.length === 0 ? (
        <div className="giapha-empty-state">
          <i className="bi bi-person-x text-4xl opacity-50 mb-2" />
          <p>{t("giapha.noData")}</p>
        </div>
      ) : (
        <div className="giapha-directory-grid">
          {filteredPersons.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              onClick={onSelectPerson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
