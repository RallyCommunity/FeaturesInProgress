Ext.define('CapabilityGroupCombobox', {
	extend: 'Rally.ui.combobox.ComboBox',
    alias: 'widget.capabilitygroupcombobox',

    constructor: function(config) {

        var filters = Ext.create('Rally.data.QueryFilter', {
            property: 'Name',
            operator: 'Contains',
            value: 'MVF Backlog'
        });

        filters = filters.or({
            property: 'Name',
            operator: 'Contains',
            value: '@'
        });


        var defaultConfig = {
            stateful: false,
            fieldLabel: 'Capability Group',
            labelWidth: 95,
            labelClsExtra: 'rui-label',
            storeConfig: {
                autoLoad: true,
                model: 'Project',
                fetch: ['Name', '_ref', 'ObjectID'],
                sorters: {
                    property: 'Name',
                    direction: 'ASC'
                },
                filters: [filters]
            }
        };

        this.callParent([Ext.Object.merge(defaultConfig, config)]);
    }

});