Ext.define('FeaturesInProgress.PortfolioKanban', {
        extend: 'Ext.Container',
        
        config: {
            context: undefined,
            features: []
        },
        
        constructor: function(config){
            this.initConfig(config);
            this.callParent(arguments);
        },

        initComponent: function(){
            this.callParent(arguments);
            
            Ext.create('Rally.data.WsapiDataStore', {
                autoLoad: true,
                model: 'TypeDefinition',
                filters: [
                    {
                        property: 'Ordinal',
                        value: 0
                    },
                    {
                        property: 'Parent.Name',
                        value: "Portfolio Item"
                    }
                ],
                listeners: {
                    load: function(store, records){
                        this._loadCardboard(records[0]);
                    },
                    scope: this
                }
            });

        },

        _loadCardboard: function(type) {
            this.type = type;
            this._loadStates({
                success: function (states) {
                    this._drawCardboard(this._createColumns(states));
                },
                scope: this
            });

        },

        /**
         * @private
         * We need the States of the selected Portfolio Item Type to know what columns to show.
         * Whenever the type changes, reload the states to redraw the cardboard.
         * @param options
         * @param options.success called when states are loaded
         * @param options.scope the scope to call success with
         */
        _loadStates:function (options) {

            Ext.create('Rally.data.WsapiDataStore', {
                model: 'State',
                context: this.getContext().getDataContext(),
                autoLoad: true,
                fetch: ['Name', 'WIPLimit', 'Description'],
                filters: [
                    {
                        property: 'TypeDef',
                        value: this.type.get('_ref')
                    },
                    {
                        property: 'Enabled',
                        value: true
                    }
                ],
                sorters: [
                    {
                        property: 'OrderIndex',
                        direction: 'ASC'
                    }
                ],
                listeners: {
                    load: function(store, records) {
                        if(options.success) {
                            options.success.call(options.scope || this, records);
                        }
                    }
                }
            });

        },

        /**
         * Given a set of columns, build a cardboard component. Otherwise show an empty message.
         * @param columns
         */
        _drawCardboard:function (columns) {
            if (columns) {
                var cardboard = this.down('#cardboard');
                if (cardboard) {
                    cardboard.destroy();
                }

                var columnConfig = {
                    xtype:'inmemorycolumn'
                };

                var cardConfig = {
                    xtype:'rallyportfoliokanbancard'
                };

                cardboard = Ext.widget('rallycardboard', {
                    types: [this.type.get('TypePath')],
                    itemId: 'cardboard',
                    attribute: 'State',
                    columns: columns,
                    maxColumnsPerBoard: columns.length,
                    columnConfig: columnConfig,
                    cardConfig: cardConfig,
                    storeConfig:{
                        filters:[
                            {
                                property:'PortfolioItemType',
                                value:this.type.get('_ref')
                            }
                        ],
                        context: this.context.getDataContext()
                    }
                });

                this.add(cardboard);

                this._attachPercentDoneToolTip(cardboard);

                Ext.EventManager.onWindowResize(cardboard.resizeAllColumns, cardboard);
            } else {
                this._showNoColumns();
            }

        },

        _showNoColumns:function () {
            this.add({
                xtype: 'container',
                cls: 'no-type-text',
                html: '<p>This Type has no states defined.</p>'
            });
        },

        _createColumns: function(states){
            if(!states.length) {
                return undefined;
            }

            var columns = [
                {
                    displayValue: 'No Entry',
                    value: null,
                    cardLimit: 50
                }
            ];

            Ext.Array.each(states, function(state){
                
                var features = Ext.Array.filter(this.getFeatures(), function(feature){
                    return feature.get('State') && feature.get('State')._refObjectName === state.get('Name');
                });
                
                columns.push({
                    value: state.get('_ref'),
                    displayValue: state.get('Name') + "(" + features.length + ")",
                    features: features
                });
            }, this);

            return columns;
        },

        _attachPercentDoneToolTip:function (cardboard) {
            Ext.create('Rally.ui.tooltip.PercentDoneToolTip', {
                target: cardboard.getEl(),
                delegate: '.percentDoneContainer',
                percentDoneName: 'PercentDoneByStoryCount',
                listeners: {
                    beforeshow: function(tip){

                        var cardElement = Ext.get(tip.triggerElement).up('.rui-card');
                        var card = Ext.getCmp(cardElement.id);

                        tip.updateContent(card.getRecord().data);
                    },
                    scope:this
                }
            });
        }

    });