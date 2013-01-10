/*
 * Redirection function - on key press or submit button press
 *
 * Works just by setting document.location
 * 
 * Version: 1.1
 * 
 * New in version 1.1: 
 *    + Shows current URL on open
 *    + Automatically closes extension window after redirect
 *    + Add 'http://' to start of URL if not present
 */

function get_location() {
    var url = document.getElementById('launch_url').value;
    if (url.substring(0,4) != "http") {
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
            window.close();
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // hook up the go button
    var go_btn = document.getElementById('go');
    go_btn.addEventListener('click', click_go);
    
    // hook up the key press
    document.body.onkeyup = handle_keypress;
    
    // find the input field
    var input_field = document.getElementById('launch_url');
    
    // put the current url in there and select it
    chrome.windows.getCurrent(function(w) {
        chrome.tabs.getSelected(w.id, function (tab) {
            input_field.value = tab.url;
            input_field.focus();
            input_field.select();
        });
        
        // list the tabs in the ul
        chrome.tabs.query({'windowId': w.id}, function(tabs) {
            var tablist = document.getElementById('tablist');
            tabs.forEach(function(tab) {
                var li = document.createElement('li');
                var title = document.createElement('span');
                title.appendChild(document.createTextNode(tab.title));
                var urlspan = document.createElement('span');
                urlspan.appendChild(document.createTextNode(tab.url));
                
                li.appendChild(title);
                li.appendChild(urlspan);
                tablist.appendChild(li);
                /*tablist.append += "<li><span class='tab-title'>" + tab.title + "</span>" +
                    "<span class='tab-url'>" + tab.url + "</span>";*/
            });
        });
    });
    
});
