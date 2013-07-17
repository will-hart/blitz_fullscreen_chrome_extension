/*
 * Redirection function - on key press or submit button press
 *
 * Works by setting document.location
 * 
 * Version: 1.2.4
 *
 * New in version 1.2.4:
 *    + Update url box to act like Omnibox.  just type a search term to se
 *      search or a URL to go to the URL
 * 
 * New in version 1.2.3:
 *    + shift + enter in url text box to create a new tab
 *    + ctrl + click a tab in the list to close it
 * 
 * New in version 1.2.2:
 *    + restyled
 *    + typing '?' first and then some search terms now searches google
 *    + highlight the current tab
 *
 * New in version 1.2.1:
 *    + Search google by typing `g?` and then a search query
 *    + Search duck duck go by typing `d?` and then a search query
 *
 * New in version 1.2:
 *    - Removed "go" button, just hit enter to submit!
 *    + Restyled
 *    + Added tab browser so you never need to leave fullscreen!
 *
 * New in version 1.1: 
 *    + Shows current URL on open
 *    + Automatically closes extension window after redirect
 *    + Add 'http://' to start of URL if not present
 */


// the current tab
var currTab;
 
// does some very basic manipulation of the url in the input box
// from version 1.2.4 keeps backwards compatibility but replicates omnibox search functionality
function get_location() {
    var url = document.getElementById('launch_url').value;
    if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(url)) {
        if (url.substring(0,4) != "http") {
            url = "http://" + url;
        }
    }
    else if (url.substring(0,2) == 'd?') {
        url = "http://www.duckduckgo.com/?q=" + url.replace('d?','').replace(' ', '+');
    }
    else
    {
        if (url.substring(0,1) == "?") 
        {
            url = url.substring(1);
        } 
        else if (url.substring(1,1) == "?")
        {
            url = url.substring(2);
        }
        url = "http://www.google.com/search?q=" + url.replace(' ', '+');
    } 
    return url;
}

// handles hitting 'enter' inside the input box
function handle_keypress(e) {
    key = e.keyCode? e.keyCode : e.charCode;
    if(key==13 && !e.shiftKey) {
        chrome.windows.getCurrent(function(w) {
            chrome.tabs.getSelected(w.id, function (tab) {
                chrome.tabs.update(tab.id, { "url": get_location() });
                window.close();
            });
        });
    } else if (key==13) {
        // create a new tab - since 1.2.3
        chrome.tabs.create({
            "url": get_location()
        });
    } else {
        return true;
    }
}

// handle clicking on the tab list and selecting the correct tab
function redirect_to_tab(e, t) {
    // get the tab id using the <li data-id> attribute
    tabid = parseInt(this.dataset['id']);
    
    // check if ctrl key is held - this closes the clicked tab (since 1.2.3)
    if (e.ctrlKey) {
        chrome.tabs.remove(tabid);
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    } else {
        // select the requested tab
        chrome.tabs.update(tabid, {"active": true});
    }
}

// lists the tabs in the ul
function do_list_tabs(w) {

    // list the tabs in the ul
    chrome.tabs.query({'windowId': w.id}, function(tabs) {
        var tablist = document.getElementById('tablist');
        
        // remove old elements
        tablist.innerHTML = "";
        
        tabs.forEach(function(tab) {
            var li = document.createElement('li');
            var title = document.createElement('span');
            var urlspan = document.createElement('span');
            
            title.appendChild(document.createTextNode(tab.title));
            title.setAttribute('class', 'tab-title');
            
            urlspan.appendChild(document.createTextNode(tab.url));
            urlspan.setAttribute('class', 'tab-url');
            
            li.setAttribute('data-id', tab.id);
            li.appendChild(title);
            li.appendChild(urlspan);
            li.addEventListener('click', redirect_to_tab);
            
            // if this is the current tab, append "active" (since v1.2.2) 
            if (tab.id == currTab) {
                li.setAttribute('class', 'active');
            }
            
            tablist.appendChild(li);
        });
        
        // resize the popup to fit the list
        var html = document.getElementsByTagName("html")[0];
        var height = document.getElementsByTagName("ul")[0].clientHeight + 
                       document.getElementById("launch_url").clientHeight + 10;
        html.style.height = height + "px";
    });
}

// sets up the list of tabs and the event handling
document.addEventListener('DOMContentLoaded', function () {
    
    // hook up the key press
    document.body.onkeyup = handle_keypress;
    
    // find the input field
    var input_field = document.getElementById('launch_url');

    // put the current url in there and select it
    chrome.windows.getCurrent(function(w) {
        chrome.tabs.getSelected(w.id, function (tab) {
            currTab = tab.id;
            input_field.value = tab.url;
            input_field.focus();
            input_field.select();
        });
        
        do_list_tabs(w);
    });
});
