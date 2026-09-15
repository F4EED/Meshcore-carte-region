const map = L.map('map', {
  zoomControl: true
});

const europeBounds = L.latLngBounds(
  [34.5, -25.0], // sud-ouest (Acores)
  [71.5, 45.0] // nord-est (ouest Russie)
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

map.fitBounds(europeBounds, {
  padding: [20, 20]
});

L.rectangle(europeBounds, {
  color: '#2563eb',
  weight: 1.5,
  fillOpacity: 0.03
}).addTo(map);

const toolsPanel = document.getElementById('tools-panel');
const toolsPanelHeader = document.getElementById('tools-panel-header');
const toolsPanelContent = document.querySelector('.tools-panel-content');
const toolsToggleButton = document.getElementById('tools-toggle-button');
const meshcoreToggle = document.getElementById('toggle-meshcore');
const meshcoreSubmenuArrow = document.getElementById('meshcore-submenu-arrow');
const meshcoreLoadStatus = document.getElementById('meshcore-load-status');
const meshcoreLoadList = document.getElementById('meshcore-load-list');
const meshcoreLegend = document.getElementById('meshcore-legend');
const meshcoreLegendList = document.getElementById('meshcore-legend-list');
/*
Sous-menus Meshcore temporairement desactives:
const meshcoreSubmenuArrow = document.getElementById('meshcore-submenu-arrow');
const meshcoreSubSwitchGroup = document.querySelector('.sub-switch-group');
const meshcoreSubToggles = [
  document.getElementById('toggle-meshcore-region-europe'),
  document.getElementById('toggle-meshcore-region-france'),
  document.getElementById('toggle-meshcore-departement-francais')
].filter(Boolean);
*/
const coordsPanel = document.getElementById('coords-panel');
const coordsPanelHeader = document.getElementById('coords-panel-header');
const mouseLat = document.getElementById('mouse-lat');
const mouseLng = document.getElementById('mouse-lng');
const identifyPanel = document.getElementById('identify-panel');
const identifyPanelHeader = document.getElementById('identify-panel-header');
const identifyPanelContent = document.getElementById('identify-panel-content');

const meshcoreGeojsonConfigs = [
  {
    id: 'europe',
    label: 'C_Europe',
    url: 'geojson/C_Europe.geojson',
    color: '#2563eb'
  },
  {
    id: 'region',
    label: 'C_FR_Region',
    url: 'geojson/C_FR_Region.geojson',
    color: '#f97316'
  },
  {
    id: 'departement',
    label: 'C_FR_Departement',
    url: 'geojson/C_FR_Departement.geojson',
    color: '#7c3aed'
  }
];

const meshcoreLayerStyleById = {
  europe: { color: '#00b7ff', weight: 6.2, opacity: 0.98, fillOpacity: 0.02 },
  region: { color: '#ff8a00', weight: 4.2, opacity: 0.95, fillOpacity: 0.02 },
  departement: { color: '#ff00ff', weight: 2.2, opacity: 0.95, fillOpacity: 0.02 }
};
const meshcoreHighlightStyleById = {
  europe: { color: '#38bdf8', weight: 8, opacity: 1, fillColor: '#38bdf8', fillOpacity: 0.1 },
  region: { color: '#fb923c', weight: 6, opacity: 1, fillColor: '#fb923c', fillOpacity: 0.12 },
  departement: { color: '#e879f9', weight: 5, opacity: 1, fillColor: '#e879f9', fillOpacity: 0.15 }
};
const MIN_ZOOM_FOR_DEPARTEMENT = 8;

let meshcoreGeojsonLayersById = {};
let meshcoreGeojsonData = {};
let meshcoreLoadStatusById = Object.fromEntries(meshcoreGeojsonConfigs.map((config) => [config.id, 'pending']));
let meshcoreLayerVisibleById = Object.fromEntries(meshcoreGeojsonConfigs.map((config) => [config.id, false]));
let meshcoreLayerLoadPromiseById = {};
let meshcoreHighlightLayerById = {};
let clickMarker = null;
let isRepeaterConfigVisible = false;
let lastIdentifyPayload = null;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const meshcoreStatusLabel = {
  pending: 'en attente',
  idle: 'pret a charger (activer l\'affichage)',
  loading: 'chargement',
  loaded: 'charge',
  error: 'erreur',
  zoom: `zoom insuffisant (< ${MIN_ZOOM_FOR_DEPARTEMENT})`
};

const renderMeshcoreLoadStatus = () => {
  if (meshcoreLoadStatus) {
    meshcoreLoadStatus.classList.toggle('is-hidden', !meshcoreToggle?.checked);
  }

  if (!meshcoreLoadList) {
    return;
  }

  meshcoreLoadList.innerHTML = meshcoreGeojsonConfigs
    .map((config) => {
      const isDepartement = config.id === 'departement';
      const zoomTooLowForDepartement = isDepartement && map.getZoom() < MIN_ZOOM_FOR_DEPARTEMENT;
      const rawStatus = meshcoreLoadStatusById[config.id] || 'pending';
      const status = zoomTooLowForDepartement ? 'zoom' : rawStatus;
      const displayStatus = status === 'pending' ? 'idle' : status;
      const isLoaded = rawStatus === 'loaded';
      const isVisible = meshcoreLayerVisibleById[config.id] !== false;
      const canToggleLayer =
        !zoomTooLowForDepartement && Boolean(meshcoreToggle?.checked) && rawStatus !== 'loading';
      return `<li class="meshcore-load-item">
        <span class="meshcore-status-dot is-${displayStatus}"></span>
        <span class="meshcore-load-text">${config.label}: ${meshcoreStatusLabel[displayStatus]}</span>
        <label class="meshcore-layer-toggle ${canToggleLayer ? '' : 'is-disabled'}" title="Afficher/masquer les limites">
          <span>Afficher les limites</span>
          <span class="switch">
            <input type="checkbox" data-layer-toggle="${config.id}" ${isVisible ? 'checked' : ''} ${canToggleLayer ? '' : 'disabled'} />
            <span class="switch-slider" aria-hidden="true"></span>
          </span>
        </label>
      </li>`;
    })
    .join('');
};

const renderMeshcoreLegend = () => {
  if (meshcoreLegend) {
    meshcoreLegend.classList.toggle('is-hidden', !meshcoreToggle?.checked);
  }

  if (!meshcoreLegendList) {
    return;
  }

  meshcoreLegendList.innerHTML = meshcoreGeojsonConfigs
    .map((config) => {
      const layerStyle = meshcoreLayerStyleById[config.id] || {};
      const lineWidth = Number(layerStyle.weight || 2);
      const lineColor = layerStyle.color || '#475569';
      return `<li class="meshcore-legend-item">
        <span class="meshcore-legend-line" style="--legend-color:${lineColor};--legend-width:${lineWidth}px;"></span>
        <span>${config.label} (${lineColor}, epaisseur ${lineWidth})</span>
      </li>`;
    })
    .join('');
};

const renderMeshcoreDependentPanels = () => {
  const isMeshcoreEnabled = Boolean(meshcoreToggle?.checked);
  if (identifyPanel) {
    identifyPanel.classList.toggle('is-hidden', !isMeshcoreEnabled);
  }
};

const getMeshcoreLayerById = (layerId) => {
  return meshcoreGeojsonLayersById[layerId] || null;
};

const syncMeshcoreLayerVisibility = () => {
  const isMeshcoreEnabled = Boolean(meshcoreToggle?.checked);

  meshcoreGeojsonConfigs.forEach((config) => {
    const isDepartement = config.id === 'departement';
    const zoomTooLowForDepartement = isDepartement && map.getZoom() < MIN_ZOOM_FOR_DEPARTEMENT;
    const layer = getMeshcoreLayerById(config.id);
    if (!layer) {
      return;
    }

    const isVisible = meshcoreLayerVisibleById[config.id] !== false;
    if (isMeshcoreEnabled && isVisible && !zoomTooLowForDepartement) {
      if (!map.hasLayer(layer)) {
        layer.addTo(map);
      }
      layer.bringToFront();
      return;
    }

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
};

const addMeshcoreLayersToMap = () => {
  syncMeshcoreLayerVisibility();
};

const removeMeshcoreLayersFromMap = () => {
  Object.values(meshcoreGeojsonLayersById).forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
};

const clearMeshcoreHighlight = () => {
  Object.values(meshcoreHighlightLayerById).forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  meshcoreHighlightLayerById = {};
};

const updateMeshcoreHighlight = (results) => {
  clearMeshcoreHighlight();
  if (!meshcoreToggle?.checked) {
    return;
  }

  results.forEach((result) => {
    if (!result.feature) {
      return;
    }
    const highlightStyle = meshcoreHighlightStyleById[result.layerId] || meshcoreHighlightStyleById.departement;
    const highlightLayer = L.geoJSON(result.feature, {
      style: highlightStyle,
      interactive: false
    }).addTo(map);
    highlightLayer.bringToFront();
    meshcoreHighlightLayerById[result.layerId] = highlightLayer;
  });

  if (clickMarker && map.hasLayer(clickMarker)) {
    clickMarker.bringToFront();
  }
};

const ensureMeshcoreLayerLoaded = async (layerId) => {
  if (meshcoreGeojsonLayersById[layerId]) {
    return;
  }

  if (!meshcoreLayerLoadPromiseById[layerId]) {
    const config = meshcoreGeojsonConfigs.find((item) => item.id === layerId);
    if (!config) {
      return;
    }

    meshcoreLoadStatusById[layerId] = 'loading';
    renderMeshcoreLoadStatus();

    meshcoreLayerLoadPromiseById[layerId] = fetch(config.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Impossible de charger ${config.url}`);
        }
        return response.json();
      })
      .then((data) => {
        meshcoreGeojsonData[layerId] = data;
        const layerStyle = meshcoreLayerStyleById[layerId] || meshcoreLayerStyleById.departement;
        meshcoreGeojsonLayersById[layerId] = L.geoJSON(data, {
          style: {
            color: layerStyle.color,
            weight: layerStyle.weight,
            opacity: layerStyle.opacity,
            fillColor: layerStyle.color,
            fillOpacity: layerStyle.fillOpacity
          }
        });
        meshcoreLoadStatusById[layerId] = 'loaded';
        renderMeshcoreLoadStatus();
      })
      .catch((error) => {
        meshcoreLoadStatusById[layerId] = 'error';
        meshcoreLayerLoadPromiseById[layerId] = null;
        renderMeshcoreLoadStatus();
        throw error;
      });
  }

  await meshcoreLayerLoadPromiseById[layerId];
};

const ensureMeshcoreLayersLoaded = async () => {
  const layersToLoad = meshcoreGeojsonConfigs
    .filter((config) => config.id !== 'departement' || map.getZoom() >= MIN_ZOOM_FOR_DEPARTEMENT)
    .map((config) => config.id);
  await Promise.all(layersToLoad.map((layerId) => ensureMeshcoreLayerLoaded(layerId)));
};

const pointInRing = (point, ring) => {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};

const pointInPolygon = (point, polygonCoords) => {
  if (!polygonCoords || polygonCoords.length === 0) {
    return false;
  }

  const inOuter = pointInRing(point, polygonCoords[0]);
  if (!inOuter) {
    return false;
  }

  for (let i = 1; i < polygonCoords.length; i += 1) {
    if (pointInRing(point, polygonCoords[i])) {
      return false;
    }
  }

  return true;
};

const pointInGeometry = (point, geometry) => {
  if (!geometry) {
    return false;
  }

  if (geometry.type === 'Polygon') {
    return pointInPolygon(point, geometry.coordinates);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygonCoords) => pointInPolygon(point, polygonCoords));
  }

  return false;
};

const formatFeatureInfo = (layerId, properties) => {
  if (!properties) {
    return 'Aucun objet';
  }

  if (layerId === 'europe') {
    const countryLabel = properties.DPAY_L_LIB || properties.name;
    const countryCode = properties.pays || properties.Region_Meshcore;
    if (countryLabel && countryCode) {
      return `${countryLabel} : ${countryCode}`;
    }
    if (countryLabel) {
      return String(countryLabel);
    }
  }

  if (layerId === 'region') {
    const name = properties.nom_officiel || properties.name;
    const meshcoreRegion = properties.Region_gaulix_MC;
    if (name && meshcoreRegion) {
      return `region : ${name} (${meshcoreRegion})`;
    }
    if (name) {
      return `region : ${name}`;
    }
  }

  if (layerId === 'departement') {
    const name = properties.nom_officiel || properties.name;
    const code = properties.code_insee;
    const meshcoreRegion = properties.region_departement_meshcore;
    if (name && code) {
      return `${name} - INSEE ${code}${meshcoreRegion ? ` (${meshcoreRegion})` : ''}`;
    }
    if (name) {
      return String(name);
    }
  }

  const fallbackCandidates = ['name', 'NAME', 'nom', 'NOM', 'libelle', 'LIBELLE', 'code_insee', 'code', 'CODE'];
  for (const key of fallbackCandidates) {
    if (properties[key]) {
      return String(properties[key]);
    }
  }

  return 'Objet trouve';
};

const identifyMeshcoreAtPoint = (latlng) => {
  return meshcoreGeojsonConfigs.map((config) => {
    const point = [latlng.lng, latlng.lat];

    const featureCollection = meshcoreGeojsonData[config.id];
    const features = featureCollection?.features || [];
    const hit = features.find((feature) => pointInGeometry(point, feature.geometry));

    return {
      layerId: config.id,
      layerLabel: config.label,
      featureName: hit ? formatFeatureInfo(config.id, hit.properties) : 'Aucun objet',
      properties: hit?.properties || null,
      feature: hit || null
    };
  });
};

const buildNodeConfigFromResults = (results) => {
  const regionProps = results.find((result) => result.layerId === 'region')?.properties || {};
  const departementProps = results.find((result) => result.layerId === 'departement')?.properties || {};
  const europeProps = results.find((result) => result.layerId === 'europe')?.properties || {};

  const countryCode = String(europeProps.pays || europeProps.Region_Meshcore || '').trim().toLowerCase();
  const regionMeshcoreCode = String(regionProps.Region_gaulix_MC || '').trim().toLowerCase();
  const departementMeshcoreCode = String(departementProps.region_departement_meshcore || '').trim().toLowerCase();

  const validCodes = [countryCode, regionMeshcoreCode, departementMeshcoreCode].filter(
    (code) => code && code !== 'fr-inconnu' && code !== 'aucun objet'
  );

  if (validCodes.length === 0) {
    return '';
  }

  return [...validCodes.map((code) => `region put ${code}`), ...validCodes.map((code) => `region allowf ${code}`), 'region save'].join('\n');
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const updateIdentifyPanel = (latlng, results, nodeConfigText, clickSummaryText = '') => {
  if (!identifyPanelContent) {
    return;
  }

  lastIdentifyPayload = { latlng, results, nodeConfigText, clickSummaryText };
  identifyPanelContent.dataset.nodeConfig = '';
  const sections = [`<div>Lat: ${latlng.lat.toFixed(5)} | Lng: ${latlng.lng.toFixed(5)}</div>`];

  const detailsByLayerId = Object.fromEntries(results.map((result) => [result.layerId, result.featureName || 'Aucun objet']));
  const regionDescription = detailsByLayerId.region || 'Aucun objet';
  const normalizedRegionDescription = /^region\s*:/i.test(regionDescription)
    ? regionDescription
    : `Region: ${regionDescription}`;
  const layersDescription = [
    `Pays: ${detailsByLayerId.europe || 'Aucun objet'}`,
    normalizedRegionDescription,
    `Departement: ${detailsByLayerId.departement || 'Aucun objet'}`
  ].filter((line) => !/Aucun objet|fr-inconnu/i.test(line));
  if (layersDescription.length > 0) {
    sections.push(`<div class="identify-spacer"></div><div>${layersDescription.map((line) => escapeHtml(line)).join('<br>')}</div>`);
  }

  if (clickSummaryText) {
    sections.push(`<div class="identify-spacer"></div><div>${escapeHtml(clickSummaryText)}</div>`);
  }

  if (nodeConfigText) {
    const toggleLabel = isRepeaterConfigVisible ? 'Masquer' : 'Afficher';
    sections.push(
      `<div class="identify-spacer"></div><div class="identify-node-config-header"><div class="identify-node-config-title">Configuration répéteur</div><div class="identify-node-config-actions"><label class="identify-toggle-row" title="${toggleLabel} la configuration"><span>${toggleLabel}</span><span class="switch"><input type="checkbox" data-toggle-node-config="true" ${isRepeaterConfigVisible ? 'checked' : ''} /><span class="switch-slider" aria-hidden="true"></span></span></label>${isRepeaterConfigVisible ? '<button type="button" class="identify-copy-button" data-copy-node-config="true" title="Copier la configuration">Copier</button>' : ''}</div></div>`
    );
    if (isRepeaterConfigVisible) {
      identifyPanelContent.dataset.nodeConfig = nodeConfigText;
      sections.push(`<pre class="identify-node-config-text">${escapeHtml(nodeConfigText)}</pre>`);
    }
  }

  identifyPanelContent.innerHTML = sections.join('');
};

const copyTextToClipboard = async (text) => {
  if (!text) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textarea);
  return success;
};

const makeDraggable = (panel, header, shouldIgnoreDrag) => {
  if (!panel || !header) {
    return;
  }

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener('mousedown', (event) => {
    if (shouldIgnoreDrag && shouldIgnoreDrag(event)) {
      return;
    }

    isDragging = true;
    const panelRect = panel.getBoundingClientRect();
    offsetX = event.clientX - panelRect.left;
    offsetY = event.clientY - panelRect.top;
  });

  document.addEventListener('mousemove', (event) => {
    if (!isDragging) {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const maxLeft = window.innerWidth - panelRect.width;
    const maxTop = window.innerHeight - panelRect.height;

    const nextLeft = clamp(event.clientX - offsetX, 0, maxLeft);
    const nextTop = clamp(event.clientY - offsetY, 0, maxTop);

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
};

if (toolsPanel && toolsPanelHeader) {
  let isCollapsed = false;

  if (toolsToggleButton && toolsPanelContent) {
    toolsToggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      isCollapsed = !isCollapsed;
      toolsPanelContent.style.display = isCollapsed ? 'none' : 'block';
      toolsToggleButton.textContent = isCollapsed ? 'Ouvrir' : 'Reduire';
      toolsToggleButton.setAttribute('aria-expanded', String(!isCollapsed));
    });
  }

  makeDraggable(toolsPanel, toolsPanelHeader, (event) => event.target === toolsToggleButton);
}

if (meshcoreToggle) {
  const syncMeshcoreGeojsonLayers = async () => {
    const isMeshcoreEnabled = meshcoreToggle.checked;

    if (meshcoreSubmenuArrow) {
      meshcoreSubmenuArrow.textContent = isMeshcoreEnabled ? '▾' : '▸';
    }

    if (!isMeshcoreEnabled) {
      meshcoreLayerVisibleById = Object.fromEntries(meshcoreGeojsonConfigs.map((config) => [config.id, false]));
      removeMeshcoreLayersFromMap();
      clearMeshcoreHighlight();
      renderMeshcoreLoadStatus();
      renderMeshcoreLegend();
      renderMeshcoreDependentPanels();
      return;
    }

    const preloadLayerIds = meshcoreGeojsonConfigs
      .filter((config) => config.id !== 'departement')
      .map((config) => config.id);
    const visibleLayerIds = meshcoreGeojsonConfigs
      .filter((config) => meshcoreLayerVisibleById[config.id])
      .filter((config) => config.id !== 'departement' || map.getZoom() >= MIN_ZOOM_FOR_DEPARTEMENT)
      .map((config) => config.id);
    const layerIdsToLoad = [...new Set([...preloadLayerIds, ...visibleLayerIds])];
    await Promise.all(layerIdsToLoad.map((layerId) => ensureMeshcoreLayerLoaded(layerId)));
    addMeshcoreLayersToMap();
    renderMeshcoreLoadStatus();
    renderMeshcoreLegend();
    renderMeshcoreDependentPanels();
  };

  meshcoreToggle.addEventListener('change', () => {
    void syncMeshcoreGeojsonLayers();
  });

  void syncMeshcoreGeojsonLayers();
}

if (meshcoreLoadList) {
  meshcoreLoadList.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const layerId = target.dataset.layerToggle;
    if (!layerId || !(layerId in meshcoreLayerVisibleById)) {
      return;
    }

    meshcoreLayerVisibleById[layerId] = target.checked;
    if (layerId === 'departement' && map.getZoom() < MIN_ZOOM_FOR_DEPARTEMENT) {
      target.checked = false;
      meshcoreLayerVisibleById[layerId] = false;
      renderMeshcoreLoadStatus();
      return;
    }
    if (target.checked) {
      void ensureMeshcoreLayerLoaded(layerId)
        .then(() => {
          syncMeshcoreLayerVisibility();
        })
        .catch((error) => {
          console.error(`Erreur chargement couche ${layerId}:`, error);
          meshcoreLayerVisibleById[layerId] = false;
          renderMeshcoreLoadStatus();
        });
      return;
    }
    syncMeshcoreLayerVisibility();
  });
}

if (identifyPanelContent) {
  identifyPanelContent.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const toggleInput = target.closest('input[data-toggle-node-config="true"]');
    if (toggleInput instanceof HTMLInputElement) {
      return;
    }
    const copyButton = target.closest('button[data-copy-node-config="true"]');
    if (!(copyButton instanceof HTMLButtonElement)) {
      return;
    }
    const nodeConfigText = identifyPanelContent.dataset.nodeConfig || '';
    if (!nodeConfigText) {
      return;
    }
    void copyTextToClipboard(nodeConfigText).catch((error) => {
      console.warn('Impossible de copier la configuration répéteur:', error);
    });
  });

  identifyPanelContent.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.dataset.toggleNodeConfig !== 'true') {
      return;
    }
    isRepeaterConfigVisible = target.checked;
    if (lastIdentifyPayload) {
      updateIdentifyPanel(
        lastIdentifyPayload.latlng,
        lastIdentifyPayload.results,
        lastIdentifyPayload.nodeConfigText,
        lastIdentifyPayload.clickSummaryText
      );
    }
  });
}

map.on('zoomend', () => {
  renderMeshcoreLoadStatus();
  syncMeshcoreLayerVisibility();
});

renderMeshcoreLoadStatus();
renderMeshcoreLegend();
renderMeshcoreDependentPanels();

/* Sous-menus Meshcore temporairement desactives.
if (meshcoreToggle && meshcoreSubSwitchGroup && meshcoreSubToggles.length > 0) {
  let previousMeshcoreSubStates = meshcoreSubToggles.map((toggle) => toggle.checked);

  const syncMeshcoreSubmenus = () => {
    const isMeshcoreEnabled = meshcoreToggle.checked;

    if (!isMeshcoreEnabled) {
      previousMeshcoreSubStates = meshcoreSubToggles.map((toggle) => toggle.checked);
    }

    meshcoreSubSwitchGroup.classList.toggle('is-disabled', !isMeshcoreEnabled);
    meshcoreSubSwitchGroup.classList.toggle('is-hidden', !isMeshcoreEnabled);
    if (meshcoreSubmenuArrow) {
      meshcoreSubmenuArrow.textContent = isMeshcoreEnabled ? '▾' : '▸';
    }

    meshcoreSubToggles.forEach((toggle, index) => {
      toggle.disabled = !isMeshcoreEnabled;
      if (isMeshcoreEnabled) {
        toggle.checked = previousMeshcoreSubStates[index] ?? true;
      }
    });
  };

  meshcoreSubToggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
      previousMeshcoreSubStates = meshcoreSubToggles.map((subToggle) => subToggle.checked);
    });
  });

  meshcoreToggle.addEventListener('change', syncMeshcoreSubmenus);
  syncMeshcoreSubmenus();
}
*/

if (coordsPanel && coordsPanelHeader) {
  makeDraggable(coordsPanel, coordsPanelHeader);
}
if (identifyPanel && identifyPanelHeader) {
  makeDraggable(identifyPanel, identifyPanelHeader);
}

if (mouseLat && mouseLng) {
  map.on('mousemove', (event) => {
    mouseLat.textContent = event.latlng.lat.toFixed(5);
    mouseLng.textContent = event.latlng.lng.toFixed(5);
  });

  map.on('mouseout', () => {
    mouseLat.textContent = '-';
    mouseLng.textContent = '-';
  });
}

map.on('click', async (event) => {
  if (!meshcoreToggle?.checked) {
    clearMeshcoreHighlight();
    if (identifyPanelContent) {
      identifyPanelContent.textContent = 'Active `Meshcore`, puis clique sur la carte.';
    }
    return;
  }

  try {
    if (identifyPanelContent) {
      identifyPanelContent.textContent = 'Recherche des informations en cours...';
    }

    await ensureMeshcoreLayersLoaded();
    if (!clickMarker) {
      clickMarker = L.circleMarker(event.latlng, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.95
      }).addTo(map);
    } else {
      clickMarker.setLatLng(event.latlng);
      if (!map.hasLayer(clickMarker)) {
        clickMarker.addTo(map);
      }
    }
    clickMarker.bringToFront();

    const results = identifyMeshcoreAtPoint(event.latlng);
    updateMeshcoreHighlight(results);
    const nodeConfigText = buildNodeConfigFromResults(results);
    updateIdentifyPanel(event.latlng, results, nodeConfigText, '');
  } catch (error) {
    console.error('Erreur identification Meshcore:', error);
    if (identifyPanelContent) {
      identifyPanelContent.textContent = `Erreur identification: ${error.message || 'inconnue'}`;
    }
  }
});
