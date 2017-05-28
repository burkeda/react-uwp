import * as React from "react";
import * as PropTypes from "prop-types";

import AppBarButton from "../AppBarButton";
import AppBarSeparator from "../AppBarSeparator";
import ThemeType from "../styles/ThemeType";
import ListView from "../ListView";

export interface DataProps {
  /**
   * Root Container Style.
   */
  contentStyle?: React.CSSProperties;
  /**
   * CommandBar title.
   */
  content?: string;
  /**
   * CommandBar title node, if just string, can use `content`.
   */
  contentNode?: React.ReactNode;
  /**
   * `PrimaryCommands`, if item `type` is not `AppBarButton` or `AppBarButton`, will not render.
   */
  primaryCommands?: React.ReactElement<any>[];
  /**
   * `SecondaryCommands`, if item `type` is not `AppBarButton` or `AppBarButton`, will not render.
   */
  secondaryCommands?: React.ReactElement<any>[];
  /**
   * control `AppBarButton` label position.
   */
  labelPosition?: "right" | "bottom" | "collapsed";
  /**
   * if using `labelPosition` "bottom", this will control default open status.
   */
  expanded?: boolean;
  /**
   * `CommandBar` layout.
   */
  flowDirection?: "row-reverse" | "row";
  /**
   * set CommandBar to `minimal` size.
   */
  isMinimal?: boolean;
  /**
   * default is `top`, set `bottom` if your `CommandBar` in your app's bottom.
   */
  verticalPosition?: "top" | "bottom";
}

export interface CommandBarProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export interface CommandBarState {
  currExpanded?: boolean;
}

export class CommandBar extends React.Component<CommandBarProps, CommandBarState> {
  static defaultProps: CommandBarProps = {
    labelPosition: "bottom",
    verticalPosition: "top"
  };

  state: CommandBarState = {
    currExpanded: this.props.expanded
  };

  static contextTypes = { theme: PropTypes.object };
  context: { theme: ThemeType };

  componentWillReceiveProps(nextProps: CommandBarProps) {
    const { expanded } = nextProps;
    if (this.state.currExpanded !== expanded) {
      this.setState({ currExpanded: expanded });
    }
  }

  toggleExpanded = (currExpanded?: any) => {
    if (typeof currExpanded === "boolean") {
      if (currExpanded !== this.state.currExpanded) this.setState({ currExpanded });
    } else {
      this.setState((prevState, prevProps) => ({ currExpanded: !prevState.currExpanded }));
    }
  }

  render() {
    const {
      content,
      contentStyle, // tslint:disable-line:no-unused-variable
      contentNode,
      labelPosition,
      primaryCommands,
      secondaryCommands,
      flowDirection, // tslint:disable-line:no-unused-variable
      expanded,
      isMinimal,
      ...attributes
    } = this.props;
    const { currExpanded } = this.state;
    const { theme } = this.context;
    const styles = getStyles(this);
    const defaultHeight = isMinimal ? 24 : 48;
    const expandedHeight = 72;

    return (
      <div style={styles.wrapper}>
        <div {...attributes} style={styles.root}>
          {(content !== void 0 || contentNode !== void 0) && (
            <div style={styles.content}>{content || contentNode}</div>
          )}
          <div style={styles.commands}>
            {(isMinimal && !currExpanded) || React.Children.toArray(primaryCommands).filter((child: any) => (
              child.type === AppBarButton || child.type === AppBarSeparator
            )).map((child: any, index: number) => (
              React.cloneElement(child, {
                labelPosition,
                key: index,
                style: child.type === AppBarSeparator ? {
                  height: 24
                } : void 0
              })
            ))}
            <AppBarButton
              labelPosition="bottom"
              style={styles.moreLegacy}
              iconStyle={{ maxWidth: defaultHeight, height: defaultHeight }}
              icon="MoreLegacy"
              onClick={this.toggleExpanded}
            />
            {secondaryCommands && (
              <ListView
                style={styles.secondaryCommands}
                items={secondaryCommands.map(itemNode => {
                  if (itemNode.type === AppBarSeparator) {
                    itemNode = React.cloneElement(itemNode, { direction: "row" });
                    return { itemNode, disable: true, style: { padding: "0 8px" } };
                  }
                  return { itemNode, onClick: this.toggleExpanded };
                })}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

function getStyles(commandBar: CommandBar): {
  wrapper?: React.CSSProperties;
  root?: React.CSSProperties;
  content?: React.CSSProperties;
  commands?: React.CSSProperties;
  moreLegacy?: React.CSSProperties;
  secondaryCommands?: React.CSSProperties;
} {
  const {
    context: { theme },
    props: {
      style,
      flowDirection,
      labelPosition,
      content,
      contentNode,
      contentStyle,
      primaryCommands,
      isMinimal,
      verticalPosition
    },
    state: { currExpanded }
  } = commandBar;
  const { prepareStyles } = theme;
  const inBottom = verticalPosition !== "top";
  const notChangeHeight = labelPosition !== "bottom";
  const haveContent = content || contentNode;
  const transition = "all .125s ease-in-out";
  const isReverse = flowDirection === "row-reverse";
  const defaultHeight = isMinimal ? 24 : 48;
  const expandedHeight = 72;
  let changedHeight: number;
  if (isMinimal) {
    changedHeight = currExpanded ? (notChangeHeight ? 48 : 72) : defaultHeight;
  } else {
    changedHeight = (currExpanded && !notChangeHeight && primaryCommands) ? expandedHeight : defaultHeight;
  }
  return {
    wrapper: theme.prepareStyles({
      height: inBottom ? "auto" : defaultHeight,
      display: "block",
      zIndex: currExpanded ? theme.zIndex.commandBar : void 0,
      ...style
    }),
    root: prepareStyles({
      position: "relative",
      display: "flex",
      flexDirection: flowDirection || (haveContent ? "row" : "row-reverse"),
      alignItems: "flex-start",
      justifyContent: haveContent ? "space-between" : "flex-start",
      fontSize: 14,
      color: theme.baseMediumHigh,
      background: theme.altHigh,
      height: changedHeight,
      transition
    }),
    content: prepareStyles({
      height: defaultHeight,
      lineHeight: `${defaultHeight}px`,
      paddingLeft: 10,
      paddingRight: 10,
      ...contentStyle
    }),
    commands: prepareStyles({
      display: "flex",
      flexDirection: flowDirection,
      alignItems: "flex-start",
      height: "100%"
    }),
    moreLegacy: theme.prepareStyles({
      height: changedHeight,
      transition
    }),
    secondaryCommands: {
      zIndex: theme.zIndex.commandBar,
      position: "absolute",
      right: isReverse ? void 0 : 0,
      left: isReverse ? 0 : void 0,
      top: inBottom ? void 0 : changedHeight,
      bottom: inBottom ? changedHeight : void 0,
      transform: `translate3D(0, ${currExpanded ? 0 : -8}px, 0)`,
      opacity: currExpanded ? 1 : 0,
      pointerEvents: currExpanded ? "all" : "none"
    }
  };
}

export default CommandBar;
