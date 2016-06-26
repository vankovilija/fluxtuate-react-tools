import React, {Component} from "react"
import {ReactView} from "fluxtuate-react"
import IconButton from 'material-ui/IconButton'
import Drawer from 'material-ui/Drawer'
import RaisedButton from 'material-ui/RaisedButton'
import AppBar from 'material-ui/AppBar'
import {List, ListItem, MakeSelectable} from 'material-ui/List'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import TrackChanges from 'material-ui/svg-icons/action/track-changes'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import moment from "moment"
import {darkBlack} from 'material-ui/styles/colors';
import {isArray, isObject, isDate, isBoolean, isNumber, isString} from "lodash/lang"
import {findIndex} from "lodash/array"
import {autobind} from "core-decorators"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const listStyle = {height: "calc(50vh - 155px)", overflow: "auto"};
const inputStyle = {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0
};

let SelectableList = MakeSelectable(List);

@ReactView
@autobind
export default class About extends Component {
    static defaultProps = {
        states: [],
        commits: [],
        selectedState: 0,
        selectedCommit: 0,
        savedValues: [],
        selectedDiskState: undefined,
        open: false
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            open: props.open,
            saveOpen: false,
            loadOpen: false,
            saveName: "",
            selectedDiskState: undefined
        };
    }

    openDebug() {
        this.setState({
            open: true
        });
    }

    closeDebug() {
        this.setState({
            open: false
        });
    }

    selectState(stateIndex) {
        this.mediate("goToState", stateIndex);
    }

    selectCommit(commitIndex) {
        this.mediate("goToCommit", commitIndex);
    }

    handleChangeCommitMessage (e) {
        this.setState({
            commitMessage: e.target.value
        });
    }

    commit() {
        this.mediate("commit", this.state.commitMessage);
        this.setState({
            commitMessage: ""
        });
    }

    handleChangeSaveName (e) {
        this.setState({
            saveName: e.target.value
        });
    }

    showSave() {
        this.setState({
            saveOpen: true
        });
    }

    closeSave() {
        this.setState({
            saveOpen: false
        });
    }

    save() {
        this.mediate("saveToDisk", this.state.saveName);
        this.setState({
            saveName: "",
            saveOpen: false
        });
    }

    handleDiskSelectChange(event, name) {
        this.setState({
            selectedDiskState: name
        });
    };

    showLoad() {
        this.setState({
            loadOpen: true
        });
    }

    closeLoad() {
        this.setState({
            loadOpen: false
        });
    }

    deleteLoad() {
        this.mediate("deleteFromDisk", this.state.selectedDiskState);
    }

    load() {
        this.mediate("loadSavedValue", this.state.selectedDiskState);
        this.closeLoad();
    }

    renderItemData(itemData) {
        if(isDate(itemData)) {
            let dateString = moment(itemData).format("DD.MM.YYYY HH:mm:ss");
            return <p title={dateString}>
                <span style={{color: darkBlack}}>Date</span> --<br/>
                {dateString}
            </p>
        }else if(isBoolean(itemData)){
            return <p>
                <span style={{color: darkBlack}}>Boolean</span> --<br/>
                {itemData?"true":"false"}
            </p>
        }else if(isNumber(itemData)) {
            return <p>
                <span style={{color: darkBlack}}>Number</span> --<br/>
                {itemData}
            </p>
        }else if(isString(itemData)) {
            return <p title={itemData}>
                <span style={{color: darkBlack}}>String</span> --<br/>
                {itemData}
            </p>
        }else if(itemData === undefined) {
            return <p>
                <span style={{color: darkBlack}}>Empty</span> --<br/>
                undefined
            </p>
        }else if(itemData === null) {
            return <p>
                <span style={{color: darkBlack}}>Empty</span> --<br/>
                null
            </p>
        }else if(!itemData) {
            return <p>
                <span style={{color: darkBlack}}>Empty</span> --<br/>
                unknown
            </p>
        }else {
            let value = itemData.toString?itemData.toString():itemData;
            return <p title={value}>
                <span style={{color: darkBlack}}>Unknown</span> --<br/>
                {value}
            </p>
        }
    }

    renderSingleDataItem(itemName, itemData, key) {
        if(!key) key = itemName;
        if(isArray(itemData) || (isObject(itemData) && !isDate(itemData))) {
            let value;
            let details;
            if(isArray(itemData)){
                value = "Array";
                if(itemData.length === 0) {
                    details = "Empty";
                }else{
                    details = `length: ${itemData.length}`;
                }
            }else{
                value = "Object";
                let properties = Object.keys(itemData).length;
                if(properties === 0) {
                    details = "Empty";
                }else{
                    details = `${properties} properties`
                }
            }
            return <ListItem
                key={key}
                primaryText={itemName}
                secondaryTextLines={2}
                secondaryText={<p><span style={{color: darkBlack}}>{value}</span> --<br/>{details}</p>}
                nestedItems={this.renderStoreStateData(itemData)}/>
        }else{
            return <ListItem
                key={key}
                primaryText={itemName}
                secondaryTextLines={2}
                secondaryText={this.renderItemData(itemData)}/>;
        }
    }

    renderStoreStateData(data){
        if(!data) return;

        let items = [];
        if(isObject(data)) {
            for (let k in data) {
                items.push(this.renderSingleDataItem(k, data[k]));
            }
        }else if(isArray(data)) {
            data.forEach((item, index)=> {
                items.push(this.renderSingleDataItem(index, item));
            });
        }

        return items;
    }

    onUpload(event) {
        var reader = new FileReader();
        reader.onload = this.onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    onReaderLoad(event){
        this.mediate("addStateToDisk", JSON.parse(event.target.result));
    }

    render() {
        let stateItems = this.props.states.slice().reverse().map((state, index)=>{
            let style;
            if(this.props.states.length - index === this.props.selectedState){
                style = {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                }
            }
            return <ListItem
                key={index}
                style={style}
                onTouchTap={this.selectState.bind(this, this.props.states.length - index)}
                primaryText={moment(state.date).format("DD.MM.YYYY HH:mm:ss")}
                nestedItems={[
                    <ListItem
                        key={index+"data"}
                        primaryText={"Data"}
                        nestedItems={this.renderStoreStateData(state.data)}
                    />,
                    <ListItem
                        key={index+"source"}
                        primaryText={state.source.changeReason}
                        secondaryText={state.source.name}
                        nestedItems={this.renderStoreStateData(state.source.data)}
                    />]}
            />
        });

        let commitItems = this.props.commits.slice().reverse().map((commit, index)=>{
            let style;
            if(this.props.commits.length - index === this.props.selectedCommit){
                style = {
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                }
            }
            return <ListItem
                key={index}
                style={style}
                onTouchTap={this.selectCommit.bind(this, this.props.commits.length - index)}
                primaryText={commit.message}
            />
        });

        let selectedSavedIndex = findIndex(this.props.savedValues, {name: this.state.selectedDiskState});
        let selectedSavedValue;
        if(selectedSavedIndex !== -1) {
            selectedSavedValue = this.props.savedValues[selectedSavedIndex];
        }

        return (
            <div>
                <MuiThemeProvider>
                    <div style={{position: "fixed", top: 0, right: 25, zIndex: 1400, width: 40}}>
                        <IconButton
                            tooltip="debug"
                            tooltipPosition="bottom-left"
                            onTouchTap={this.openDebug}
                        >
                            <TrackChanges />
                        </IconButton>
                        <Drawer width={500} containerStyle={{maxWidth: "calc(100vw - 20px)"}} openSecondary={true} open={this.state.open} >
                            <AppBar
                                iconElementLeft={<IconButton
                                    tooltip="close"
                                    tooltipPosition="bottom-left"
                                    onTouchTap={this.closeDebug}
                                >
                                    <NavigationClose />
                                </IconButton>}
                                title="Debug" />
                            <Subheader>States History</Subheader>
                            <div style={listStyle}>
                                <List>
                                    {stateItems}
                                </List>
                            </div>
                            <Divider />
                            <Subheader>Commits</Subheader>
                            <div style={listStyle}>
                                <List>
                                    {commitItems}
                                </List>
                            </div>
                            <Divider />
                            <div>
                                <TextField
                                    style={{width: "100%"}}
                                    hintText="Commit message"
                                    multiLine={true}
                                    rows={2}
                                    rowsMax={2}
                                    onChange={this.handleChangeCommitMessage}
                                    value={this.state.commitMessage}
                                /><br />
                                <RaisedButton label="Commit" style={{width: "100%"}} onTouchTap={this.commit} />
                                <div>
                                    <RaisedButton label="Save" primary={true} style={{float: "left", width: "50%"}} onTouchTap={this.showSave} />
                                    <Dialog
                                        title="Save state to disk"
                                        actions={[<FlatButton
                                                    label="Cancel"
                                                    primary={true}
                                                    onTouchTap={this.closeSave}
                                                  />,
                                                  <FlatButton
                                                    label="Save"
                                                    primary={true}
                                                    disabled={this.state.saveName === ""}
                                                    onTouchTap={this.save}
                                                  />]}
                                        modal={true}
                                        open={this.state.saveOpen}
                                    >
                                        <TextField
                                            style={{width: "100%"}}
                                            hintText="Save name"
                                            floatingLabelText="Name"
                                            onChange={this.handleChangeSaveName}
                                            value={this.state.saveName}
                                        />
                                    </Dialog>
                                    <RaisedButton label="Load" secondary={true} style={{float: "right", width: "50%"}} onTouchTap={this.showLoad} />
                                    <Dialog
                                        title="Load data from disk"
                                        actions={[<FlatButton
                                                    label="Upload"
                                                    labelPosition="before"
                                                    style={{float: "left"}}
                                                  >
                                                    <input type="file" style={inputStyle} accept=".json, text/json" onChange={this.onUpload} />
                                                  </FlatButton>,
                                                  <FlatButton
                                                    label="Cancel"
                                                    primary={true}
                                                    onTouchTap={this.closeLoad}
                                                  />,
                                                  <FlatButton
                                                    label="Delete"
                                                    secondary={true}
                                                    disabled={selectedSavedValue === undefined}
                                                    onTouchTap={this.deleteLoad}
                                                  />,
                                                  <a href={selectedSavedValue?("data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedSavedValue))):undefined} download={selectedSavedValue?(selectedSavedValue.name + ".json"):undefined}>
                                                      <FlatButton
                                                        label="Download"
                                                        primary={true}
                                                        disabled={selectedSavedValue === undefined}
                                                      />
                                                  </a>,
                                                  <FlatButton
                                                    label="Load"
                                                    primary={true}
                                                    disabled={selectedSavedValue === undefined}
                                                    onTouchTap={this.load}
                                                  />]}
                                        modal={true}
                                        open={this.state.loadOpen}
                                    >
                                        <SelectableList
                                            value={this.state.selectedDiskState}
                                            onChange={this.handleDiskSelectChange}
                                        >
                                            {this.props.savedValues.slice().reverse().map((value, index)=>(
                                                    <ListItem
                                                        key={index}
                                                        value={value.name}
                                                        primaryText={value.name}
                                                    />
                                            ))}
                                        </SelectableList>
                                    </Dialog>
                                </div>
                            </div>
                        </Drawer>
                    </div>
                </MuiThemeProvider>
                <div style={{float: "left", width: "calc(100% - 50px)", position: "relative"}}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}