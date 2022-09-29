import {
  CloseButton,
  FormControl, HStack, Select,
} from '@chakra-ui/react';
import { RelationalExpressionOperator } from '../../types';
import { ConditionInput } from './ConditionInput';

const {
  Equals,
  Contains,
  Matches,
} = RelationalExpressionOperator;

interface FormData {
  operator: RelationalExpressionOperator
  leftValue: string
  rightValue: string
}

interface Props {
  values: FormData
  defaultValues?: FormData
  onChange: (details: Partial<FormData>) => void
}

export const Condition = ({
  values,
  defaultValues,
  onChange,
}: Props) => {
  const onLeftValueChange = (value: string) => {
    onChange({
      leftValue: value,
      rightValue: values.rightValue,
      operator: values.operator,
    });
  };

  const onRightValueChange = (value: string) => {
    onChange({
      leftValue: values.leftValue,
      rightValue: value,
      operator: values.operator,
    });
  };

  const onOperatorChange = (value: RelationalExpressionOperator) => {
    onChange({
      leftValue: values.leftValue,
      rightValue: values.rightValue,
      operator: value,
    });
  };

  return (
    <HStack width="100%">
      <HStack width="100%" spacing={8} alignItems="flex-start">
        <ConditionInput
          onChange={onLeftValueChange}
          defaultValue={defaultValues?.leftValue}
          value={values.leftValue}
        />
        <FormControl>
          <Select
            flexShrink={1}
            defaultValue={Equals}
            onChange={(e) => onOperatorChange(e.target.value as RelationalExpressionOperator)}
            value={values.operator}
          >
            <option value={Equals}>is</option>
            <option value={Contains}>contains</option>
            <option value={Matches}>matches</option>
          </Select>
        </FormControl>
        <ConditionInput
          onChange={(value) => onRightValueChange(value)}
          defaultValue={defaultValues?.rightValue}
          value={values.rightValue}
        />
      </HStack>
      <CloseButton />
    </HStack>
  );
};
