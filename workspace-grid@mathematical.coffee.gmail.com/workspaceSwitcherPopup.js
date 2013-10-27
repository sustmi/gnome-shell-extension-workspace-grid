const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const WorkspaceSwitcher = imports.ui.workspaceSwitcherPopup;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ThumbnailsBox = Me.imports.extension;

const ANIMATION_TIME = WorkspaceSwitcher.ANIMATION_TIME;
const DISPLAY_TIMEOUT = WorkspaceSwitcher.DISPLAY_TIMEOUT;

/************
 * Workspace Switcher that can do rows and columns as opposed to just rows.
 ************/
const WorkspaceSwitcherPopup = new Lang.Class({
    Name: 'WorkspaceSwitcherPopup',
    Extends: WorkspaceSwitcher.WorkspaceSwitcherPopup,

    _workspaceSwitcherPopupThumbnailsExtension: {},

    _init: function() {
        let ext = this._workspaceSwitcherPopupThumbnailsExtension;
        
        this.actor = new St.Widget({ reactive: true,
                                     x: 0,
                                     y: 0,
                                     width: global.screen_width,
                                     height: global.screen_height,
                                     style_class: 'workspace-switcher-group' });
        Main.uiGroup.add_actor(this.actor);
        
        ext.thumbnailsBox = new ThumbnailsBox.ThumbnailsBox();
        ext.thumbnailsBox._createThumbnails();
        ext.thumbnailsBox._background.set_style('border: 1px solid rgba(128, 128, 128, 0.4); \
                                                 border-radius: 9px; \
                                                 padding: 11px;');
        
        this.actor.add_actor(ext.thumbnailsBox.actor);
        
        this._redisplay();
        
        ext.timeoutId = Mainloop.timeout_add(DISPLAY_TIMEOUT, Lang.bind(this, this._onTimeout));
    },
    
    display: function(direction, activeWorkspaceIndex) {
        let ext = this._workspaceSwitcherPopupThumbnailsExtension;
        
        this._redisplay();
        
        if (ext.timeoutId != 0)
            Mainloop.source_remove(ext.timeoutId);
        ext.timeoutId = Mainloop.timeout_add(DISPLAY_TIMEOUT, Lang.bind(this, this._onTimeout));
    },
    
    _redisplay: function() {
        let ext = this._workspaceSwitcherPopupThumbnailsExtension;
				
        let workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
        
        let [containerMinHeight, containerNatHeight] = ext.thumbnailsBox.actor.get_preferred_height(global.screen_width);
        let [containerMinWidth, containerNatWidth] = ext.thumbnailsBox.actor.get_preferred_width(containerNatHeight);
        
        this.actor.x = workArea.x + Math.floor((workArea.width - containerNatWidth) / 2);
        this.actor.y = workArea.y + Math.floor((workArea.height - containerNatHeight) / 2);
    },
    
    _onTimeout: function() {
        let ext = this._workspaceSwitcherPopupThumbnailsExtension;
        
        Mainloop.source_remove(ext.timeoutId);
        ext.timeoutId = 0;
        Tweener.addTween(ext.thumbnailsBox.actor, { opacity: 0.0,
                                                    time: ANIMATION_TIME,
                                                    transition: 'easeOutQuad',
                                                    onComplete: function() { this.destroy(); },
                                                    onCompleteScope: this });
    },
    
    destroy: function() {
        let ext = this._workspaceSwitcherPopupThumbnailsExtension;
        
        if (ext.timeoutId) {
            this._onTimeout();
        }
        
        ext.thumbnailsBox._destroyThumbnails();
        ext.thumbnailsBox.destroy();
        this.actor.destroy();

        this.emit('destroy');
    }

});
