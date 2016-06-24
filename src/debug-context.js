import React, {Component, PropTypes} from "react"
import {ReactContext} from "fluxtuate-react"
import DebugTools from "fluxtuate-tools-plugin"
import Config from "./debug-config"
import DebugView from "./debug-view"

@ReactContext
export default class AppContext extends Component {
    static propTypes = {
        open: PropTypes.bool.isRequired
    };
    
    static defaultProps = {
        open: false
    };
    
    componentWillMount() {
        //configure the context and attach the router plugin to the context (will be attached to all child contexts by default)
        this.props.context.config(Config).plugin(DebugTools).start();
    }

    render() {
        return (
                <DebugView open={this.props.open}>
                    {this.props.children}
                </DebugView>
        );
    }
}