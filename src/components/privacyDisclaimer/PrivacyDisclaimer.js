import React, { useState } from 'react';
import { Alert, Button } from 'reactstrap';

const PrivacyDisclaimer = (props) => {
  const [visible, setVisible] = useState(true);

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
                <span className="p-2"><Button outline color="primary" size="sm" active>Awesome! Save My Data</Button></span>
                <span className="p-2"><Button outline color="secondary" size="sm" active>No Way, I Hate Cookies</Button></span>
              </div>
            </div>
          </div>
        </Alert>
      </div>
  );
}

export default PrivacyDisclaimer;