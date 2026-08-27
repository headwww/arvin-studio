import type { ComponentToken as AffixComponentToken } from '../../affix/style';
import type { ComponentToken as AlertComponentToken } from '../../alert/style';
import type { ComponentToken as AnchorComponentToken } from '../../anchor/style';
import type { ComponentToken as AvatarComponentToken } from '../../avatar/style';
import type { ComponentToken as BadgeComponentToken } from '../../badge/style';
import type { ComponentToken as ButtonComponentToken } from '../../button/style';
import type { ComponentToken as CheckboxComponentToken } from '../../checkbox/style';
import type { ComponentToken as InputNumberComponentToken } from '../../input-number/style';
import type { ComponentToken as InputComponentToken } from '../../input/style';
import type { ComponentToken as PopconfirmComponentToken } from '../../popconfirm/style';
import type { ComponentToken as RadioComponentToken } from '../../radio/style';
import type { ComponentToken as SpaceComponentToken } from '../../space/style';
import type { ComponentToken as SwitchComponentToken } from '../../switch/style';
import type { ComponentToken as TooltipComponentToken } from '../../tooltip/style';

export interface ComponentTokenMap {
  Affix?: AffixComponentToken;
  Alert?: AlertComponentToken;
  Anchor?: AnchorComponentToken;
  Avatar?: AvatarComponentToken;
  Badge?: BadgeComponentToken;
  Button?: ButtonComponentToken;
  Checkbox?: CheckboxComponentToken;
  Input?: InputComponentToken;
  InputNumber?: InputNumberComponentToken;
  Popconfirm?: PopconfirmComponentToken;
  Radio?: RadioComponentToken;
  Space?: SpaceComponentToken;
  Switch?: SwitchComponentToken;
  Tooltip?: TooltipComponentToken;
}
