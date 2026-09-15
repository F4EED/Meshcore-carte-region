(function () {
  const FR = window.MESHCORE_FR;
  const map = L.map("map", { zoomControl: true }).setView([45.44, 4.39], 8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 18,
  }).addTo(map);

  const els = {
    place: document.getElementById("place"),
    codes: document.getElementById("codes"),
    commands: document.getElementById("commands"),
    copy: document.getElementById("copy"),
    copyNote: document.getElementById("copy-note"),
    search: document.getElementById("search"),
    includeDept: document.getElementById("include-dept"),
    includeAllowf: document.getElementById("include-allowf"),
    includeHome: document.getElementById("include-home"),
  };

  const regionColors = {
    "fr-ara": "#c45c12",
    "fr-bfc": "#6b5b3a",
    "fr-bre": "#3d6b8a",
    "fr-cvl": "#5a6b3d",
    "fr-cor": "#7a4a6a",
    "fr-ges": "#4a5a7a",
    "fr-hdf": "#5a4a3a",
    "fr-idf": "#3a4a5a",
    "fr-nor": "#4a6a5a",
    "fr-naq": "#6a4a3a",
    "fr-occ": "#5a3a4a",
    "fr-pdl": "#3a5a4a",
    "fr-pac": "#4a4a6a",
  };

  let geojsonLayer = null;
  let selectedLayer = null;
  let current = null;
  let dotMarker = null;

  function styleFeature(feature) {
    const region = FR.departments[feature.properties.code];
    const color = regionColors[region] || "#666";
    const selected = current && current.insee === feature.properties.code;
    return {
      color: selected ? "#1b1b1b" : color,
      weight: selected ? 2.5 : 1,
      opacity: 1,
      fillColor: color,
      fillOpacity: selected ? 0.45 : 0.18,
    };
  }

  function resetStyle() {
    if (geojsonLayer) geojsonLayer.resetStyle();
    if (selectedLayer) selectedLayer.setStyle(styleFeature(selectedLayer.feature));
  }

  function pointInRing(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function pointInGeom(lng, lat, geometry) {
    if (!geometry) return false;
    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates;
      if (!pointInRing(lng, lat, rings[0])) return false;
      for (let i = 1; i < rings.length; i++) {
        if (pointInRing(lng, lat, rings[i])) return false;
      }
      return true;
    }
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.some((polygon) => {
        if (!pointInRing(lng, lat, polygon[0])) return false;
        for (let i = 1; i < polygon.length; i++) {
          if (pointInRing(lng, lat, polygon[i])) return false;
        }
        return true;
      });
    }
    return false;
  }

  function findLayerByInsee(insee) {
    let found = null;
    geojsonLayer.eachLayer((layer) => {
      if (layer.feature.properties.code === insee) found = layer;
    });
    return found;
  }

  function findLayerByPoint(latlng) {
    let found = null;
    geojsonLayer.eachLayer((layer) => {
      if (pointInGeom(latlng.lng, latlng.lat, layer.feature.geometry)) found = layer;
    });
    return found;
  }

  function buildCommands(sel) {
    if (!sel) return "";
    const lines = [];
    const chain = [
      { code: FR.country.code, parent: null },
      { code: sel.region, parent: FR.country.code },
    ];
    if (els.includeDept.checked) {
      chain.push({ code: sel.dept, parent: sel.region });
    }
    chain.forEach((item) => {
      lines.push(item.parent ? `region put ${item.code} ${item.parent}` : `region put ${item.code}`);
    });
    if (els.includeAllowf.checked) {
      chain.forEach((item) => lines.push(`region allowf ${item.code}`));
    }
    if (els.includeHome.checked) {
      const home = els.includeDept.checked ? sel.dept : sel.region;
      lines.push(`region home ${home}`);
    }
    lines.push("region save");
    return lines.join("\n");
  }

  function render() {
    if (!current) {
      els.place.textContent = "Cliquez sur la carte ou cherchez un département.";
      els.codes.innerHTML = "";
      els.commands.value = "";
      return;
    }
    const regionName = FR.regions[current.region].name;
    els.place.textContent = current.name + " — " + regionName;
    const parts = [
      `<div><span class="k">Pays</span> <code>${FR.country.code}</code></div>`,
      `<div><span class="k">Région</span> <code>${current.region}</code></div>`,
    ];
    if (els.includeDept.checked) {
      parts.push(`<div><span class="k">Département</span> <code>${current.dept}</code></div>`);
    }
    els.codes.innerHTML = parts.join("");
    els.commands.value = buildCommands(current);
  }

  function selectLayer(layer, latlng) {
    selectedLayer = layer;
    const props = layer.feature.properties;
    const region = FR.departments[props.code];
    current = {
      insee: props.code,
      name: props.nom,
      region: region,
      dept: FR.deptCode(props.code),
    };
    if (dotMarker) map.removeLayer(dotMarker);
    if (latlng) {
      dotMarker = L.circleMarker(latlng, {
        radius: 5,
        color: "#fff",
        weight: 1.5,
        fillColor: "#1b6b38",
        fillOpacity: 1,
      }).addTo(map);
    }
    resetStyle();
    render();
  }

  function onOptionsChange() {
    render();
  }

  ["include-dept", "include-allowf", "include-home"].forEach((id) => {
    document.getElementById(id).addEventListener("change", onOptionsChange);
  });

  els.copy.addEventListener("click", async () => {
    const text = els.commands.value.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      els.copyNote.textContent = "Commandes copiées.";
    } catch (err) {
      els.commands.select();
      document.execCommand("copy");
      els.copyNote.textContent = "Commandes copiées.";
    }
    setTimeout(() => {
      els.copyNote.textContent = "";
    }, 2000);
  });

  els.search.addEventListener("input", () => {
    const q = els.search.value.trim().toLowerCase();
    if (!q || !geojsonLayer) return;
    let match = null;
    geojsonLayer.eachLayer((layer) => {
      const code = String(layer.feature.properties.code).toLowerCase();
      const name = layer.feature.properties.nom.toLowerCase();
      const dept = FR.deptCode(layer.feature.properties.code);
      if (!match && (code === q || name.startsWith(q) || dept === q || dept.endsWith("-" + q))) {
        match = layer;
      }
    });
    if (!match) return;
    selectLayer(match);
    map.fitBounds(match.getBounds(), { padding: [24, 24], maxZoom: 9 });
  });

  fetch("data/departements.geojson")
    .then((res) => {
      if (!res.ok) throw new Error("geojson");
      return res.json();
    })
    .then((data) => {
      geojsonLayer = L.geoJSON(data, {
        style: styleFeature,
        onEachFeature: function (feature, layer) {
          const region = FR.departments[feature.properties.code];
          const label = feature.properties.nom + " (" + FR.deptCode(feature.properties.code) + ")";
          layer.bindTooltip(label + (region ? " · " + region : ""), {
            sticky: true,
            direction: "top",
          });
          layer.on("mouseover", function () {
            this.setStyle({ fillOpacity: 0.4, weight: 2 });
          });
          layer.on("mouseout", function () {
            resetStyle();
          });
          layer.on("click", function (ev) {
            L.DomEvent.stopPropagation(ev);
            selectLayer(layer, ev.latlng);
          });
        },
      }).addTo(map);

      map.on("click", function (ev) {
        const layer = findLayerByPoint(ev.latlng);
        if (layer) selectLayer(layer, ev.latlng);
      });

      const loire = findLayerByInsee("42");
      if (loire) selectLayer(loire);
    })
    .catch(() => {
      els.place.textContent = "Impossible de charger les contours des départements.";
    });
})();
