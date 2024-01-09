import Origo from 'Origo';

const Abstractcsw = function Abstractcsw(options = {}) {
  const {
    additionalExclusionGroups = [],
    url = '',
    metadataPropertyName = 'any',
    layerExclusionProp
  } = options;

  const exclusionGroups = ['background', 'none'].concat(additionalExclusionGroups);

  let viewer;

  function isEligible(layer) {
    const hasAbstract = layer.get('abstract');
    const isExcluded = exclusionGroups.includes(layer.get('group'));
    const hasProperty = layer.get(layerExclusionProp);
    return !hasAbstract && !isExcluded && !hasProperty;
  }

  function getEligibleLayers(layers) {
    return layers.filter((layer) => isEligible(layer));
  }

  function buildFilter(layerNames) {
    const multipleLayers = layerNames.length > 1;
    let filter = '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">';

    if (multipleLayers) {
      filter += `
            <ogc:Or>`;
    }

    layerNames.forEach((layerName) => {
      filter += `
              <ogc:PropertyIsEqualTo matchCase="true">
                <ogc:PropertyName>${metadataPropertyName}</ogc:PropertyName>
                <ogc:Literal>${layerName}</ogc:Literal>
              </ogc:PropertyIsEqualTo>`;
    });

    if (multipleLayers) {
      filter += `
            </ogc:Or>`;
    }

    filter += `
          </ogc:Filter>`;
    return filter;
  }

  function setLayerAbstracts(records, layers) {
    Array.from(records).forEach((record) => {
      Array.from(record.getElementsByTagName('dc:URI')).forEach((uri) => {
        const targetLayer = layers.find((layer) => layer.get('name') === uri.getAttribute('name'));
        if (targetLayer) {
          const abstract = record.getElementsByTagName('dct:abstract')[0].textContent;
          targetLayer.set('abstract', abstract);
        }
      });
    });
  }

  return Origo.ui.Component({
    name: 'abstractcsw',
    async onAdd(evt) {
      viewer = evt.target;
      const allLayers = viewer.getLayers();
      const eligibleLayers = getEligibleLayers(allLayers);
      if (!eligibleLayers.length) return;

      const eligibleLayersArrays = [];
      eligibleLayers.forEach((_, index) => {
        if (index % 20 === 0) {
          eligibleLayersArrays.push(eligibleLayers.slice(index, index + 20));
        }
      });

      if (!eligibleLayersArrays.length === 0) {
        eligibleLayersArrays.push([eligibleLayers]);
      }

      const fetchResponses = await Promise.all(eligibleLayersArrays.map((layersArray) => {
        const body = `
        <csw:GetRecords
        xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" service="CSW" version="2.0.2" resultType="results" maxRecords="500">
        <csw:Query typeNames="csw:Record">
          <csw:ElementSetName>full</csw:ElementSetName>
          <csw:Constraint version="1.1.0">
            ${buildFilter(layersArray.map((layer) => layer.get('name')))}
        </csw:Constraint>
        </csw:Query>
        </csw:GetRecords>`;

        const requestOpts = {
          method: 'POST',
          headers: {
            'Content-type': 'application/xml'
          },
          body
        };
        return fetch(url, requestOpts);
      }));

      const responseXmls = await Promise.all(fetchResponses.map((response) => {
        if (response.ok) {
          return response.text();
        } return '';
      }));

      responseXmls.forEach((xml) => {
        if (!xml) return;
        const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
        const records = xmlDoc.getElementsByTagName('csw:Record');
        setLayerAbstracts(records, eligibleLayers);
      });
    }
  });
};

export default Abstractcsw;
