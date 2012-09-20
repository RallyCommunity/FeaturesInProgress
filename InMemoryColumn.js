Ext.define('FeaturesInProgress.InMemoryColumn', {
    extend: 'Rally.ui.cardboard.Column',
    alias: 'widget.inmemorycolumn',
    
    config: {
        enableRanking: false,
        /**
         * @cfg {Array}
         */
        data: []
    },

    _queryForData: function(){
        Ext.defer(function(){
            this.createAndAddCards(this.features || []);
            this.fireEvent("load", this, this.features || []);
        }, 1, this);
    }
    
});