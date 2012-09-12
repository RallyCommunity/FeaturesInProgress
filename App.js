Ext.define('FeaturesInProgress', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        this.add({
            xtype: 'component',
            autoEl: 'h1',
            cls: 'titleText',
            html: 'In Progress Features'
        });
        this.add({
            xtype: 'component',
            cls: 'grayLabel',
            html: 'The "In-Progress" Features shown have child User Stories assigned to the selected Project'
        }); 
        this.buildProjectPicker();
        this.buildCheckbox();
        this.buildKanbanBoard();
    },

    buildCheckbox: function() {
        var checkbox = Ext.widget('checkbox', {
            labelSeparator: '',
            hideLabel: true,
            boxLabel: 'Search the entire user story hierarchy instead of user stories just below a portfolio item (much slower)'
        });
        checkbox.on('change', this.checkboxSelected, this);
        this.add(checkbox);
    },
    
    buildProjectPicker: function(){
        var picker = Ext.widget('rallyprojectpicker', {
            fieldLabel: 'Select a project:'
        });
        picker.on('change', this.projectSelected, this);
        this.add(picker);
    },
    
    projectSelected: function(field, value){
        this.board.updateWithProject(value);
    },

    checkboxSelected: function(field, value) {
        this.board.updateWithHierarchyScope(value);
    },
    
    buildKanbanBoard: function(){
        var board = this.board = Ext.create('FeaturesInProgress.InProgressBoard', {
            context: this.getContext()
        });
        this.add(board);
    }
});
