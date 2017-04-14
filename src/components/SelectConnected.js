import { fromJS } from 'immutable';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import wrapWithClickout from 'react-clickout';

import {
  addSelect,
  toggleOpen,
  saveSelected,
  searchOptions,
  removeSelect,
} from '../redux/actions';

import SelectBase, { basePropTypes, baseDefaultProps } from './SelectBase';

const additionalPropTypes = {
  initialSelected: PropTypes.array.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  saveSelected: PropTypes.func.isRequired,
};

export class SelectConnectedComponent extends Component {
  componentDidMount() {
    const { id } = this.props;
    this.props.addSelect({ id });
  }

  componentWillReceiveProps(nextProps) {
    const { id, initialSelected } = nextProps;
    if (nextProps.initialSelected[0] !== this.props.initialSelected[0]) {
      this.props.saveSelected({ id, selected: initialSelected });
    }
  }

  componentWillUnmount() {
    const { id } = this.props;
    this.props.removeSelect({ id });
  }

  onCheck = value => () => {
    const { id, selected, isMultipleSelect } = this.props;
    let updatedSelected = [];
    if (isMultipleSelect) {
      if (selected.includes(value)) {
        updatedSelected = selected.filter(s => s !== value);
      } else {
        updatedSelected = selected.push(value);
      }
      this.props.saveSelected({ id, selected: updatedSelected });
    } else {
      // not multipleSelect
      this.props.saveSelected({ id, selected: [value] });
      this.props.toggleOpen({ id, open: false });
    }
  }

  onSearch = text => () => {}

  onToggleOpen = () => {
    this.props.toggleOpen({ id: this.props.id, isOpen: !this.props.isOpen });
  }

  handleClickout = () => {
    if (!this.props.isOpen) return;
    this.props.toggleOpen({ id: this.props.id, isOpen: false });
  }

  render() {
    return (
      <SelectBase
        uniqueKey={this.props.uniqueKey}
        isMultipleSelect={this.props.isMultipleSelect}
        isSearchable={this.props.isSearchable}
        label={this.props.label}
        placeholder={this.props.placeholder}
        options={this.props.options}
        selected={this.props.selected || fromJS([])}
        isOpen={this.props.isOpen}
        toggleOpen={this.onToggleOpen}
        onCheck={this.onCheck}
        onSearch={this.onSearch}
        styles={this.props.styles}
      />);
  }
}

const mapStateToProps = (state, ownProps) => ({
  isOpen: state.select.getIn([ownProps.id, 'isOpen']) || false,
  selected: state.select.getIn([ownProps.id, 'selected']),
});

const mapDispatchToProps = {
  addSelect,
  toggleOpen,
  saveSelected,
  searchOptions,
  removeSelect,
};

SelectConnectedComponent.propTypes = Object.assign({}, basePropTypes, additionalPropTypes);
SelectConnectedComponent.defaultProps = baseDefaultProps;

const connected = connect(mapStateToProps, mapDispatchToProps)(
  wrapWithClickout(SelectConnectedComponent));

export default connected;
