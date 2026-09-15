/* Codes MeshCore France — pays/région alignés sur regions.meshcore.nz
   Département : convention communautaire (fr-42, fr-69, …). */
window.MESHCORE_FR = {
  country: { code: "fr", name: "France" },
  regions: {
    "fr-ara": { name: "Auvergne-Rhône-Alpes" },
    "fr-bfc": { name: "Bourgogne-Franche-Comté" },
    "fr-bre": { name: "Bretagne" },
    "fr-cvl": { name: "Centre-Val de Loire" },
    "fr-cor": { name: "Corse" },
    "fr-ges": { name: "Grand Est" },
    "fr-hdf": { name: "Hauts-de-France" },
    "fr-idf": { name: "Île-de-France" },
    "fr-nor": { name: "Normandie" },
    "fr-naq": { name: "Nouvelle-Aquitaine" },
    "fr-occ": { name: "Occitanie" },
    "fr-pdl": { name: "Pays de la Loire" },
    "fr-pac": { name: "Provence-Alpes-Côte d'Azur" }
  },
  departments: {
    "01": "fr-ara", "03": "fr-ara", "07": "fr-ara", "15": "fr-ara",
    "26": "fr-ara", "38": "fr-ara", "42": "fr-ara", "43": "fr-ara",
    "63": "fr-ara", "69": "fr-ara", "73": "fr-ara", "74": "fr-ara",
    "21": "fr-bfc", "25": "fr-bfc", "39": "fr-bfc", "58": "fr-bfc",
    "70": "fr-bfc", "71": "fr-bfc", "89": "fr-bfc", "90": "fr-bfc",
    "22": "fr-bre", "29": "fr-bre", "35": "fr-bre", "56": "fr-bre",
    "18": "fr-cvl", "28": "fr-cvl", "36": "fr-cvl", "37": "fr-cvl",
    "41": "fr-cvl", "45": "fr-cvl",
    "2A": "fr-cor", "2B": "fr-cor",
    "08": "fr-ges", "10": "fr-ges", "51": "fr-ges", "52": "fr-ges",
    "54": "fr-ges", "55": "fr-ges", "57": "fr-ges", "67": "fr-ges",
    "68": "fr-ges", "88": "fr-ges",
    "02": "fr-hdf", "59": "fr-hdf", "60": "fr-hdf", "62": "fr-hdf",
    "80": "fr-hdf",
    "75": "fr-idf", "77": "fr-idf", "78": "fr-idf", "91": "fr-idf",
    "92": "fr-idf", "93": "fr-idf", "94": "fr-idf", "95": "fr-idf",
    "14": "fr-nor", "27": "fr-nor", "50": "fr-nor", "61": "fr-nor",
    "76": "fr-nor",
    "16": "fr-naq", "17": "fr-naq", "19": "fr-naq", "23": "fr-naq",
    "24": "fr-naq", "33": "fr-naq", "40": "fr-naq", "47": "fr-naq",
    "64": "fr-naq", "79": "fr-naq", "86": "fr-naq", "87": "fr-naq",
    "09": "fr-occ", "11": "fr-occ", "12": "fr-occ", "30": "fr-occ",
    "31": "fr-occ", "32": "fr-occ", "34": "fr-occ", "46": "fr-occ",
    "48": "fr-occ", "65": "fr-occ", "66": "fr-occ", "81": "fr-occ",
    "82": "fr-occ",
    "44": "fr-pdl", "49": "fr-pdl", "53": "fr-pdl", "72": "fr-pdl",
    "85": "fr-pdl",
    "04": "fr-pac", "05": "fr-pac", "06": "fr-pac", "13": "fr-pac",
    "83": "fr-pac", "84": "fr-pac"
  }
};

window.MESHCORE_FR.deptCode = function (insee) {
  return "fr-" + String(insee).toLowerCase();
};
