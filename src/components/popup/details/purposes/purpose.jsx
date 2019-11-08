import { h } from 'preact';
import style from "./purposes.less";
import Label from "../../../label/label";
import Switch from '../../../switch/switch';


class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'purposes'
	};
}

const Purpose = (props) => {
	const {
		purpose,
		index,
		isActive,
		onToggle,
		createOnShowVendors,
		isTechnical,
		isPublisherPurpose = false
	} = props;

	return (
		<div className={style.purposeDetail}>
			<div className={style.detailHeader}>
				<div className={style.title}>
					<LocalLabel localizeKey={`purpose${purpose.id}.title`}>{purpose.name}</LocalLabel>
				</div>
				{!isTechnical &&
					<div className={style.active}>
						<LocalLabel localizeKey={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</LocalLabel>
						<Switch
							isSelected={isActive}
							dataId={index}
							onClick={onToggle}
						/>
					</div>
				}
			</div>
			<div className={style.body}>
				<LocalLabel localizeKey={`purpose${purpose.id}.description`} />
				{!isPublisherPurpose && (
					<div>
						<a className={style.vendorLink}
						   onClick={createOnShowVendors({isCustom: false, purposeIds: [purpose.id]})}>
							<LocalLabel prefix='purposes' localizeKey='showVendors'>Show full vendor list</LocalLabel>
						</a>
						<a className={style.vendorLink}
						   onClick={createOnShowVendors({isCustom: true, purposeIds: [purpose.id]})}>
							<LocalLabel prefix='purposes' localizeKey='showCustomVendors'>Show full custom vendor list</LocalLabel>
						</a>
					</div>
				)}
			</div>
		</div>
	);
};

export default Purpose;
