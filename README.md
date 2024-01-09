# Abstractsettercsw

Aims to supply predefined Origo map layers with a matching abstract from a metadata (csw) service.
Utilizes one csw getRecords request for all eligible layers (which reduces network traffic but can be slow in the case of very many layers in a map. Another reason is that the plugin requests full records in order to receive both the abstract metadata property and the layer name (the latter in a `<dc:URI>` property)).


It has been tested with a Geonetwork 3.10.x instance.

#### Configuration options
- `additionalExclusionGroups`: what additional group/s beyond `background` and `none` to not look for eligible layers in. An array of strings. Optional. 
- `url`: a csw endpoint. A string. Mandatory.
- `metadataPropertyName`: what metadata record property name to match layer names with. Defaults to `any` which looks everywhere in a metadata record. A string. Optional.
- `layerExclusionProp`: layer property that makes a layer ineligible (the plugin won't look for an abstract for it). A string. Optional.

#### Example usage

**index.html:**
```html
    <body>
    <div id="app-wrapper">
    </div>
    <script src="js/origo.js"></script>
    <script src="plugins/abstractcsw.js"></script>

    <script type="text/javascript">
      //Init origo
      const origo = Origo('index.json');
      origo.on('load', function (viewer) {

	      const abstractcsw = Abstractcsw({
		      url: 'https://adomain.org/geonetwork/srv/eng/csw'
	      });
        viewer.addComponent(abstractcsw);
      });
    </script>
```
