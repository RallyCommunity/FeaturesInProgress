Ext.define('FeaturesInProgress', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {

        this.buildTitle();
        this.buildCapabilityGroupDropdown();
        this.buildLoadButton();
        this.buildLoadingText();
        this.buildKanbanBoard();
    },

    buildTitle: function() {
        this.add({
            xtype: 'component',
            autoEl: 'h1',
            cls: 'titleText',
            itemId: 'titleText',
            html: 'Features by Capability Group'
        });

        this.add({
            xtype: 'component',
            cls: 'grayLabel',
            html: 'The "In-Progress" Portfolio Items shown have child User Stories assigned to the selected Capability Group that are not yet Accepted or Delivered'
        });
    },

    buildLoadingText: function () {

        this.add({
            xtype: 'component',
            itemId: 'loadingText',
            cls: 'loadingText',
            html: ''
        });
    },

    buildCapabilityGroupDropdown: function() {
        var combo = Ext.create('CapabilityGroupCombobox');
        combo.on('ready', this.selectCapabilityGroup, this);
        combo.on('change', this.selectCapabilityGroup, this);
        this.add(combo);
    },

    selectCapabilityGroup: function(combobox) {
        this.board.updateCapabilityGroup(combobox.getValue());
    },

    buildLoadButton: function() {
        this.loadButton = this.add({
            xtype: 'rallybutton',
            cls: 'loadButton',
            text: 'Load',
            handler: function() {
                this.loadButton.disable();
                this.board.buildBoard();
            },
            scope: this
        });
    },
    
    buildKanbanBoard: function(){
        var board = this.board = Ext.create('FeaturesInProgress.InProgressBoard', {
            context: this.getContext()
        });
        this.board.on('doneLoading', function(){
            this.loadButton.enable();
        }, this);
        this.add(board);
    }
});
