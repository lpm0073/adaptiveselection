import React from 'react';
import { a } from 'react-router-dom';
import { legalUrl } from '../../shared/urls';
import './styles.css';

function Footer(props) {

    var d = new Date();
    const curr_year = d.getFullYear();

    return(
        <React.Fragment>
            <footer key="app-footer">
                <div className="footer">
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            <div className="text-center">                        
                                <a className="mx-1" href={legalUrl} target="_blank" rel="noopener noreferrer">Legal</a><span> | </span>
                                <a className="mx-1" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a><span> | </span>
                                <a className="mx-1" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a><span className="footer-extra-links"> | </span>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">             
                        <div className="col-auto">
                            <p>© Copyright 2015 - {curr_year}. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </React.Fragment>
    );
}

export default Footer;