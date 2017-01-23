import * as React from "react";
import ReactLazyLoad from "react-lazyload";
import { DataProps as ReactLazyloadProps } from "react-lazyload";
import { Icon, ThemeType } from "react-uwp";

interface DataProps {
	isLazyLoad?: boolean;
	useDivContainer?: boolean;
}
interface ImageProps extends DataProps, ReactLazyloadProps, React.HTMLAttributes<HTMLElement> {}
interface ImageState {
	showEmptyImage?: boolean;
}

class Placeholder extends React.Component<React.HTMLAttributes<HTMLImageElement>, {}> {
	static contextTypes = { theme: React.PropTypes.object };
	context: { theme: ThemeType };
	render() {
		const { ...attributes } = this.props;
		const { theme } = this.context;
		return (
			<div {...attributes as any} style={{ background: theme.chromeMedium }}>
				<Icon
					style={{
						color: theme.baseMedium,
						fontSize: 80
					}}
					hoverStyle={{}}
				>
					&#xEB9F;
				</Icon>
			</div>
		);
	}
}

export default class Image extends React.Component<ImageProps, {}> {
	static defaultProps: ImageProps = {
		isLazyLoad: true,
		useDivContainer: false,
		once: false,
		offset: 0,
		scroll: true,
		overflow: false,
		throttle: 60,
	};

	state = {
		showEmptyImage: false
	};

	errorHandler = (e: any) => this.setState({ showEmptyImage: true });

	render() {
		const {
			isLazyLoad, useDivContainer,
			once, scroll, offset, overflow, resize, debounce, throttle,
			...attributes
		} = this.props;
		const placeholder = (attributes.placeholder || <Placeholder {...attributes} />) as any;

		const ImageOrDiv = () => (useDivContainer
			?
			<div
				{...attributes as React.HTMLAttributes<HTMLDivElement>}
				style={{
					background: `url(${attributes.src}) no-repeat center center / contain`,
					...attributes.style,
				}}
			/>
			: <img {...attributes as React.HTMLAttributes<HTMLImageElement>} onError={this.errorHandler} />
		);

		if (!attributes.src || this.state.showEmptyImage) {
			return isLazyLoad ? placeholder : null;
		}

		if (isLazyLoad) {
			return (
				<ReactLazyLoad
					{...{
						once,
						scroll,
						offset,
						overflow,
						resize,
						debounce,
						throttle
					}}
					once={false}
					offset={offset}
					height={attributes.height}
					placeholder={placeholder}
				>
					<ImageOrDiv />
				</ReactLazyLoad>
			);
		}

		return <ImageOrDiv />;
	}
}