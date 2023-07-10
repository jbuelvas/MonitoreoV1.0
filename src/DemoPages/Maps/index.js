import React, {Fragment} from 'react';
import {Route} from 'react-router-dom';

// DASHBOARDS

import Analisis from './Analisis/';

// Layout

import AppHeader from '../../Layout/AppHeader/';
import AppSidebar from '../../Layout/AppSidebar/';
import AppFooter from '../../Layout/AppFooter/';

const Dashboards = ({match}) => (
    <Fragment>
        <AppHeader/>
        <div className="app-main">
            <AppSidebar/>
            <div className="app-main__outer">
                <div className="app-main__inner">
                    <Route path={`${match.url}/analisis`} component={Analisis}/>
                </div>
                {/* <AppFooter/> */}
            </div>
        </div>
    </Fragment>
);

export default Dashboards;