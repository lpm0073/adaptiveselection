import React, { useState } from 'react';
import { Alert, Button } from 'reactstrap';

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return false;
}

const PrivacyDisclaimer = (props) => {
  var shouldShow = true;

  var seen = getCookie("privacyPolicy");
  console.log("cookie", seen);
  if (seen && seen !== "null") {
    console.log("should not show")
    shouldShow = false;
  } else {
      console.log("should show")
      setCookie("privacyPolicy", null, 365);
  }  

  const [visible, setVisible] = useState(shouldShow);
  const onDismiss = () => setVisible(false);
  const hostname = window.location.hostname;



  return (
      
      <div className="fixed-bottom myAlert-bottom p-1 pr-5 pl-5">
        <Alert color="secondary" isOpen={visible} toggle={onDismiss}>
          <div class="row">
            <div className="col-8">
              <p>{hostname} uses third party cookies to analyze our traffic (Google Analytics) and serve personalize ads (Google AdSense). We also set our own cookie when you acknowledge this message so we can stop showing it to you. For instructions on how to revoke consent/acknowledgement, or opt out, please visit our Privacy Policy.</p>
            </div>            
            <div className="col-4">
              <div className="p-2 text-right">
                <span className="p-2"><Button outline color="primary" size="sm" active>ACCEPT COOKIES</Button></span>
              </div>
            </div>
          </div>
        </Alert>
      </div>
  );
}

export default PrivacyDisclaimer;