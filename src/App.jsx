/**
 * Copyright (c) 2018 Andrew Choung
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { withStyles, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import uniqueId from 'lodash/uniqueId';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import Datatable from 'components/Datatable';
import CsvFileImporter from 'components/CsvFileImporter';
import AppBar from 'components/AppBar';
import { APP_BAR_TITLE, TOOLBAR_ITEMS } from 'constants/appBarConstants';
import './App.css';

const theme = createMuiTheme({
    palette: {
        primary: blue,
        type: 'dark',
    },
});

const styles = {
    container: {
        flexGrow: 1,
    },
    componentWrapper: {
        display: 'flex',
    },
    component: {
        flex: '1 auto',
    },
};

/**
 * This app renders a CSV file uploader that uploads the CSV data into a datatable.
 *
 * @class App
 * @extends Component
 */
class App extends Component {
    static propTypes = {
        // props from HOCs
        classes: PropTypes.object.isRequired,
    };

    state = {
        tableColumns: [],
        tableRows: [],
    };

    /**
     * Lifecycle method that is invoked before rendering when new props or state are being received.
     *
     * @param {Object} nextProps The next props object
     * @param {Object} nextState The next state object
     */
    shouldComponentUpdate(nextProps, nextState) {
        const { tableColumns, tableRows } = this.state;
        const { tableColumns: nextTableColumns, tableRows: nextTableRows } = nextState;

        return !isEqual(tableColumns, nextTableColumns) || !isEqual(tableRows, nextTableRows);
    }

    /**
     * Handles the event when a CSV file import is successful.
     * 
     * @param {Object[]} dataRows The CSV file data rows imported
     */
    onCsvFileLoaded = (dataRows) => {
        // guarding against bad object data input
        if (!(dataRows && dataRows.length)) {
            return;
        }

        // remove the table column names from the beginning of the data row list
        const tableColumns = dataRows.shift();

        // parse the data rows into datatable rows mapping row values to the table column name
        const tableRows = dataRows.reduce((accumulator, rowValue) => {            
            const fmtRowObject = {};
            rowValue.forEach((columnValue, columnIndex) => {
                const headerName = tableColumns[columnIndex];
                fmtRowObject[headerName] = columnValue;
            });

            // check if it has an id before assigning a unique one to it
            fmtRowObject.id = isNil(fmtRowObject.id) ? uniqueId() : fmtRowObject.id;

            accumulator.push(fmtRowObject);
            return accumulator;
        }, []);

        this.setState({
            tableColumns,
            tableRows,
        });
    };

    /**
     * Renders the component in JSX syntax
     * 
     * @returns {JSX} the component view
     */
    render() {
        const { tableColumns, tableRows } = this.state;
        const { classes } = this.props;

        let viewComponent = null;
        if (tableColumns.length && tableRows.length) {
            viewComponent = <Datatable tableColumns={tableColumns} tableRows={tableRows} />;
        } else {
            viewComponent = <CsvFileImporter onFileLoaded={this.onCsvFileLoaded} />;
        }

        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.container}>
                    <AppBar title={APP_BAR_TITLE} toolbarItems={TOOLBAR_ITEMS} />
                    <div className={classes.componentWrapper}>
                        <div className={classes.component}>
                            {viewComponent}
                        </div>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(App);
