﻿/**
  * iOS specific dialogs functions implementation.
  */
import promises = require("promises");
import dialogs = require("ui/dialogs");
import dialogs_common = require("ui/dialogs/dialogs-common");
import view = require("ui/core/view");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(dialogs_common, exports);


function createUIAlertView(message: string, options: dialogs.DialogOptions): UIKit.UIAlertView {
    var alert = new UIKit.UIAlertView();
    alert.title = options && options.title ? options.title : "";
    alert.message = message;
    return alert;
}

function createDelegate(callback) {
    var delegateType = Foundation.NSObject.extends({}, {}).implements({
        protocol: "UIAlertViewDelegate",
        implementation: {
            alertViewClickedButtonAtIndex: function (view, index) {
                callback(view, index);
            }
        }
    });
    return new delegateType;
}

function addButtonsToAlertDialog(alert: UIKit.UIAlertView, options: dialogs.DialogButtonsOptions): void {
    if (!options)
        return;

    if (options.okButtonText) {
        alert.addButtonWithTitle(options.okButtonText);
    }

    if (options.cancelButtonText) {
        alert.addButtonWithTitle(options.cancelButtonText);
    }

    if (options.neutralButtonText) {
        alert.addButtonWithTitle(options.neutralButtonText);
    }
}

export function alert(message: string, options = { title: dialogs_common.ALERT, okButtonText: dialogs_common.OK }): promises.Promise<void> {
    var d = promises.defer<void>();
    try {
        var alert = createUIAlertView(message, options);

        if (options.okButtonText) {
            alert.addButtonWithTitle(options.okButtonText);
        }

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve();
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();
    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function confirm(message: string, options  = { title: dialogs_common.CONFIRM, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL }): promises.Promise<boolean> {
    var d = promises.defer<boolean>();
    try {
        var alert = createUIAlertView(message, options);

        addButtonsToAlertDialog(alert, options);

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve(index === 2 ? undefined : index === 0);
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function prompt(message: string, defaultText?: string,
    options = { title: dialogs_common.PROMPT, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL, inputType: dialogs_common.InputType.PlainText }): promises.Promise<dialogs.PromptResult> {
    var d = promises.defer<dialogs.PromptResult>();
    try {
        var alert = createUIAlertView(message, options);

        if (options.inputType === dialogs_common.InputType.Password) {
            alert.alertViewStyle = UIKit.UIAlertViewStyle.UIAlertViewStyleSecureTextInput;
        } else {
            alert.alertViewStyle = UIKit.UIAlertViewStyle.UIAlertViewStylePlainTextInput;
        }

        addButtonsToAlertDialog(alert, options);

        var textField = alert.textFieldAtIndex(0);
        textField.text = defaultText ? defaultText : "";

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve({ result: index === 2 ? undefined : index === 0, text: textField.text });
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function login(message: string, userName?: string, password?: string,
    options = { title: dialogs_common.LOGIN, okButtonText: dialogs_common.OK, cancelButtonText: dialogs_common.CANCEL }): promises.Promise<dialogs.LoginResult> {
    var d = promises.defer<dialogs.LoginResult>();
    try {
        var alert = createUIAlertView(message, options);

        alert.alertViewStyle = UIKit.UIAlertViewStyle.UIAlertViewStyleLoginAndPasswordInput;

        addButtonsToAlertDialog(alert, options);

        var userNameTextField = alert.textFieldAtIndex(0);
        userNameTextField.text = userName ? userName : "";

        var pwdTextField = alert.textFieldAtIndex(1);
        pwdTextField.text = password ? password : "";

        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = createDelegate(function (view, index) {
            d.resolve({ result: index === 2 ? undefined : index === 0, userName: userNameTextField.text, password: pwdTextField.text });
            // Remove the local variable for the delegate.
            delegate = undefined;
        });

        alert.delegate = delegate;

        alert.show();

    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export class Dialog {
    private _ios: UIKit.UIAlertView;
    //private _view: view.View;
    //private _nativeView: UIKit.UIView;

    constructor() {
        this._ios = new UIKit.UIAlertView();
    }

    get ios(): UIKit.UIAlertView {
        return this._ios;
    }

    get title(): string {
        return this.ios.title;
    }
    set title(value: string) {
        this.ios.title = value;
    }

    get message(): string {
        return this.ios.message;
    }
    set message(value: string) {
        this.ios.message = value;
    }
    /*
    get view(): view.View {
        return this._view;
    }
    set view(value: view.View) {
        this._view = value;
        this._nativeView = this._view.ios;
        this._nativeView.removeFromSuperview();

        // Not working on iOS7!
        this.ios.addSubview(this._nativeView);
    }*/

    public show() {
        this.ios.show();
    }

    public hide() {
        this.ios.dismissWithClickedButtonIndexAnimated(0, true);
    }
}