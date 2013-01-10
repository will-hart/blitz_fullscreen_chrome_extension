/*
 * Redirection function - on key press or submit button press
 *
 * Works just by setting document.location
 */

function get_location() {
    var url = document.getElementById('launch_url').value;
    if (url.substring(0,3) == "www") {
        url = "http://" + url;
    }
    return url;
}

function handle_keypress(e) {
    key = e.keyCode? e.keyCode : e.charCode;
    if(key==13) {
        click_go();
    } else {
        return true;
    }
}

function click_go(e) {
    chrome.windows.getCurrent(function(w) {
        chrome.tabs.getSelected(w.id, function (tab) {
            chrome.tabs.update(tab.id, { "url": get_location() });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // hook up the go button
    var go_btn = document.getElementById('go');
    go_btn.addEventListener('click', click_go);
    
    // hook up the key press
    document.body.onkeyup = handle_keypress;
    
    // select the field
    var input_field = document.getElementById('launch_url');
    input_field.focus();
    input_field.select();
});
