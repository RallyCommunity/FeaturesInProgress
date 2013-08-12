Ext.define('FeaturesInProgress.InProgressBoard', {
    extend: 'Ext.Container',
    
    config: {
        context: undefined,
        selectedProject: undefined
    },
    
    constructor: function(config){
        this.initConfig(config);
        this.callParent(arguments);
    },
    
    initComponent: function(){
        this.callParent(arguments);
        
        this.add({
            xtype: 'container',
            itemId: 'boardContainer',
            items: {
                xtype: 'component',
                cls: 'noProjectSelected',
                html: 'Choose a capability group and click Load to see portfolio items in progress'
            }
        });
        
        Ext.create('Rally.data.WsapiDataStore', {
            autoLoad: true,
            model: 'TypeDefinition',
            filters: [
                {
                    property: 'Parent.Name',
                    value: 'Portfolio Item'
                },
                {
                    property: 'Ordinal',
                    value: 0
                }
            ],
            listeners: {
                load: function(store, records){
                    Rally.data.ModelFactory.getModel({
                        type: records[0].get('TypePath'),
                        success: function(model){
                            this.portfolioItemModel = model;
                            this.setTitleText('In Progress ' + this.portfolioItemModel.elementName + 's');
                        },
                        scope: this
                    });
                },
                scope: this
            }
        });
    },
    
    buildBoard: function(){
        
        var container = this.down('#boardContainer');
        container.removeAll();

        this.findFeaturesForProject(this.getSelectedProject(), function(featureRefs){
            featureRefs = Ext.Array.unique(featureRefs);
            
            this.hydrateFeatureRefs({
                featureRefs: featureRefs,
                callback: function(features){
                    var cardboard = Ext.create('FeaturesInProgress.PortfolioKanban', {
                        context: this.getContext(),
                        features: features
                    });
                    container.add(cardboard);
                    this.fireEvent('doneLoading');
                },
                scope: this
            });
            
        }, this);
        
    },
    
    findFeaturesForProject: function(project, callback, scope){

        var storyFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'Parent',
            operator: '!=',
            value: 'null'
        });
        
        storyFilter = storyFilter.or({
            property: 'PortfolioItem',
            operator: '!=',
            value: 'null'
        });
                    
        storyFilter = storyFilter.and({
            property: 'ScheduleState',
            operator: '<=',
            value: 'Completed'
        });
        
        storyFilter = storyFilter.and({
            property: 'ScheduleState',
            operator: '>=',
            value: 'Backlog'
        });
        
        var store = Ext.create('Rally.data.WsapiDataStore', {
            limit: Infinity,
            model: 'User Story',
            fetch: ['Parent','PortfolioItem'],
            filters: storyFilter,
            context: {
                project: project,
                projectScopeDown: true
            }
        });

        this.updateLoadingText('Finding user stories (may take a while...)');
        
        store.load({
            callback: function(store){
                if(store) {
                    this.numRecordsFound = store.count();

                    this.updateLoadingText('Finished 0/' + this.numRecordsFound);

                    this.findFeaturesForUserStories(store, [], function(featureRefs){
                        callback.call(scope, featureRefs);
                    }, this);
                }
                
            },
            scope: this
        });
        
    },
    
    /**
     * Given a list of stories, finds the collection of feature refs that they belong to.
     * Calls callback with feature refs.
     */
    findFeaturesForUserStories: function(store, features, callback, scope){
        features = features || [];
        
        if(store.count() === 0){
            this.updateLoadingText('');
            callback.call(scope, features);
            return;
        }
        
        this.updateLoadingText('Finished ' + (this.numRecordsFound - store.count()) + '/' + this.numRecordsFound);

        var story = store.first();
        this.findFeatureForUserStory(story, function(feature){
            if(feature){
                features.push(feature);
            }
            
            store.remove(story);
            this.findFeaturesForUserStories(store, features, callback, scope);
        }, this);
        
    },
    
    /**
     * Looks at the parent recursively until it finds a portfolio item.
     * Calls the callback with the found portfolio item ref.
     */
    findFeatureForUserStory: function(story, callback, scope){
        
        if(story.get('PortfolioItem')){
            callback.call(scope, story.get('PortfolioItem')._ref);
        } else if(story.get('Parent')) {
            
            var oid = Rally.util.Ref.getOidFromRef(story.get('Parent')._ref);
            story.self.load(oid, {
                callback: function(parent){
                    this.findFeatureForUserStory(parent, callback, scope);
                },
                scope: this
            });
            
        } else {
            callback.call(scope);
        }
    },
    
    hydrateFeatureRefs: function(options){
        options.features = options.features || [];
        
        if(options.featureRefs.length === 0){
            options.callback.call(options.scope, options.features);
            return;
        }
        
        var ref = options.featureRefs.shift();
        this._hydrate({
            ref: ref,
            callback: function(feature){
                options.features.push(feature);
                this.hydrateFeatureRefs(options);
            },
            scope: this
        });
        
        
    },
    
    _hydrate: function(options){
        var oid = Rally.util.Ref.getOidFromRef(options.ref);
        this.portfolioItemModel.load(oid, {
            callback: function(record){
                options.callback.call(options.scope, record);
            }
        });
    },

    setTitleText: function(title) {
        var comp = Ext.ComponentQuery.query('#titleText');
        if(comp && comp[0] && comp[0].getEl()) {
            comp[0].getEl().setHTML(title);
        }
    },

    updateLoadingText: function(message) {
        var comp = Ext.ComponentQuery.query('#loadingText');
        if(comp && comp[0] && comp[0].getEl()) {
            comp[0].getEl().setHTML(message);
        }
    },

    updateCapabilityGroup: function(ref) {
        this.setSelectedProject(ref);
    }
});