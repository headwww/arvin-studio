import type { ComponentToken as ButtonComponentToken } from '../../button/style';
import type { ComponentToken as CheckboxComponentToken } from '../../checkbox/style';
import type { ComponentToken as InputNumberComponentToken } from '../../input-number/style';
import type { ComponentToken as InputComponentToken } from '../../input/style';
import type { ComponentToken as SpaceComponentToken } from '../../space/style';

export interface ComponentTokenMap {
  Button?: ButtonComponentToken;
  Checkbox?: CheckboxComponentToken;
  Input?: InputComponentToken;
  InputNumber?: InputNumberComponentToken;
  Space?: SpaceComponentToken;
}
