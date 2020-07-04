import React, { useState } from 'react';
import { Alert, Button } from 'reactstrap';
import { getCookie, setCookie } from '../../shared/Cookies';

const PrivacyDisclaimer = (props) => {
  var shouldShow = true;

  var seen = getCookie("privacyPolicy");
  if (seen && seen !== "null") {
    shouldShow = false;
  }  

  const [visible, setVisible] = useState(shouldShow);
  const onDismiss = () => setVisible(false);
  const onOkClicked = () => {
    setVisible(false);
    setCookie("privacyPolicy", true, 365);
  }
  const hostname = window.location.hostname;



  return (
      
      <div className="fixed-bottom myAlert-bottom p-1 pr-5 pl-5">
        <Alert color="secondary" isOpen={visible} toggle={onDismiss}>
          <div class="row">
            <div className="col-10">
              <p>{hostname} uses third party cookies to analyze our traffic (Google Analytics) and serve personalize ads (Google AdSense). We also set our own cookie when you acknowledge this message so we can stop showing it to you. For instructions on how to revoke consent/acknowledgement, or opt out, please visit our Privacy Policy.</p>
            </div>            
            <div className="col-2">
              <div className="p-2 text-right">
                <span className="p-2"><Button onClick={onOkClicked} outline color="primary" size="sm" active>ACCEPT COOKIES</Button></span>
              </div>
            </div>
          </div>
        </Alert>
      </div>
  );
}

export default PrivacyDisclaimer;