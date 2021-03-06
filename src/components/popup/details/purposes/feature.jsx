import { h } from 'preact';
import style from "./purposes.less";
import Label from "../../../label/label";
import Switch from "../../../switch/switch";

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'features'
	};
}

const Feature = (props) => {
	const {
		feature,
		isSpecial,
		createOnShowVendors,
		index,
		isActive,
		onToggle
	} = props;

	const prefix = isSpecial ? 'specialFeatures' : 'features';

	return (
		<div className={style.purposeDetail}>
			<div className={style.detailHeader}>
				<div className={style.title}>
					<LocalLabel prefix={prefix} localizeKey={`feature${feature.id}.title`}>{feature.name}</LocalLabel>
				</div>
			</div>
				{isSpecial &&
					<div className={style.active}>
						<div className={style.switch}>
							<LocalLabel collapseEmpty={true} className={style.caption} prefix={prefix} localizeKey='acceptButton'></LocalLabel>
							<LocalLabel prefix={prefix} localizeKey={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</LocalLabel>
							<Switch
								isSelected={isActive}
								dataId={index}
								onClick={onToggle}
							/>
						</div>
					</div>}

			<div className={style.body}>
				<LocalLabel prefix={prefix} localizeKey={`feature${feature.id}.description`}>{feature.description}</LocalLabel>
				<div>
					<a className={style.vendorLink} onClick={createOnShowVendors({isCustom: false,
						featureId: feature.id, isSpecial})}>
						<LocalLabel prefix={prefix} localizeKey='showVendors'>Show IAB vendor list</LocalLabel>
					</a>
				</div>
				<div>
					<a className={style.vendorLink} onClick={createOnShowVendors({isCustom: true,
						featureId: feature.id, isSpecial})}>
						<LocalLabel collapseEmpty={true} prefix={prefix} localizeKey='showCustomVendors'>Show custom vendor list</LocalLabel>
					</a>
				</div>
			</div>
		</div>
	);
};

export default Feature;
