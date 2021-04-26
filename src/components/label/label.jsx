import { h, Component } from 'preact';
import {Localize} from '../../lib/localize';

const lookup = new Localize().lookup;

export default class Label extends Component {
	static defaultProps = {
		prefix: ''
	};

	render(props, state) {
		const { prefix, localizeKey, className, children, id } = props;
		const key = prefix ? `${prefix}.${localizeKey}` : localizeKey;
		const localizedContent = lookup(key);
		const style = localizedContent ? "" : "display:none";

		return (
			<span
				id={id}
				style={style}
				class={props.class || className}
				dangerouslySetInnerHTML={localizedContent && {__html: localizedContent}}>
				{!localizedContent && children}
			</span>
		);
	}
}
