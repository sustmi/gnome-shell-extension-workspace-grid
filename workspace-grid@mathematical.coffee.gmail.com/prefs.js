/*global global, log */ // <-- jshint
/** Credit:
 *  taken from the gnome shell extensions repository at
 *  git.gnome.org/browse/gnome-shell-extensions
 */

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('workspace-grid');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const KEY_ROWS = 'num-rows';
const KEY_COLS = 'num-columns';
const KEY_WRAPAROUND = 'wraparound';
const KEY_MAX_HFRACTION = 'max-screen-fraction';
const KEY_MAX_HFRACTION_COLLAPSE = 'max-screen-fraction-before-collapse';

function init() {
    Convenience.initTranslations();
}

function LOG(msg) {
    //log(msg);
}

const WorkspaceGridPrefsWidget = new GObject.Class({
    Name: 'WorkspaceGrid.Prefs.Widget',
    GTypeName: 'WorkspaceGridPrefsWidget',
    Extends: Gtk.Grid,

    _init: function (params) {
        this.parent(params);
        this.margin = this.row_spacing = this.column_spacing = 10;
        this._rownum = 0;
        this._settings = Convenience.getSettings();

        let item = new Gtk.Label({
            label: _("NOTE: maximum number of workspaces is 36.")
        });
        item.set_line_wrap(true);
        this.addItem(item, 0, 2, 1);


        this.addSpin(_("Number of rows of workspaces:"), KEY_ROWS, true,
            1, 36, 1);

        this.addSpin(_("Number of columns of workspaces:"), KEY_COLS, true,
            1, 36, 1);
    
        this.addBoolean(_("Wraparound workspaces when navigating?"),
            KEY_WRAPAROUND);

        item = new Gtk.Label({
            label: _("The following settings determine how much horizontal " +
                    "space the workspaces box\n in the overview can take up, " +
                    "as a fraction of the screen width.")
        });
        item.set_line_wrap(true);
        this.addItem(item, 0, 2, 1);

        this.addScale(_("Maximum width (fraction):"), KEY_MAX_HFRACTION, false,
                0, 1, 0.05);
        this.addScale(_("Maximum width (fraction) before collapse:"),
                KEY_MAX_HFRACTION_COLLAPSE, false, 0, 1, 0.05);
    },

    addBoolean: function (text, key) {
        let item = new Gtk.Switch({active: this._settings.get_boolean(key)});
        this._settings.bind(key, item, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.addRow(text, item);
    },

    addRow: function (text, widget, wrap) {
        let label = new Gtk.Label({
            label: text,
            hexpand: true,
            halign: Gtk.Align.START
        });
        label.set_line_wrap(wrap || false);
        this.attach(label, 0, this._rownum, 1, 1); // col, row, colspan, rowspan
        this.attach(widget, 1, this._rownum, 1, 1);
        this._rownum++;
    },

    addSpin: function (text, key, is_int, lower, upper, increment) {
        /* Length cutoff item */
        let adjustment = new Gtk.Adjustment({
            lower: lower,
            upper: upper,
            step_increment: increment || 1
        });
        let spinButton = new Gtk.SpinButton({
            adjustment: adjustment,
            digits: (is_int ? 0 : 2),
            snap_to_ticks: true,
            numeric: true,
        });
        if (is_int) {
            spinButton.set_value(this._settings.get_int(key));
            spinButton.connect('value-changed', Lang.bind(this, function (spin) {
                let value = spinButton.get_value_as_int();
                if (this._settings.get_int(key) !== value) {
                    this._settings.set_int(key, value);
                }
            }));
        } else {
            spinButton.set_value(this._settings.get_double(key));
            spinButton.connect('value-changed', Lang.bind(this, function (spin) {
                let value = spinButton.get_value();
                if (this._settings.get_double(key) !== value) {
                    this._settings.set_double(key, value);
                }
            }));
        }
        return this.addRow(text, spinButton);
    },

    addScale: function (text, key, is_int, lower, upper, increment) {
        let hscale = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL,
                lower, upper, increment);
        hscale.set_digits(is_int ? 0 : 2);
        hscale.set_hexpand(true);
        if (is_int) {
            hscale.set_value(this._settings.get_int(key));
            hscale.connect('value-changed', Lang.bind(this, function () {
                let value = hscale.get_value();
                if (this._settings.get_int(key) !== value) {
                    this._settings.set_int(key, value);
                }
            }));
        } else {
            hscale.set_value(this._settings.get_double(key));
            hscale.connect('value-changed', Lang.bind(this, function () {
                let value = hscale.get_value();
                if (this._settings.get_double(key) !== value) {
                    this._settings.set_double(key, value);
                }
            }));
        }
        return this.addRow(text, hscale, true);
    },

    addItem: function (widget, col, colspan, rowspan) {
        this.attach(widget, col || 0, this._rownum, colspan || 2, rowspan || 1);
        this._rownum++;
    }
});

function buildPrefsWidget() {
    let widget = new WorkspaceGridPrefsWidget();
    widget.show_all();

    return widget;
}
