import * as React from "react";

/**
 * Component properties
 */
interface Props {
  className?: string;
  component: (props: DebounceProps) => React.ReactElement;
  key?: string | number;
  disabled?: boolean;
  name?: string;
  label?: string;
  debounceTimeout?: number;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Interface representing debounce properties given to render function
 */
interface DebounceProps {
  key?: string | number;
  disabled?: boolean;
  name?: string;
  label?: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

/**
 * Component for applying debounce to any text input
 */
const WithDebounce: React.FC<Props> = ({
  name,
  disabled,
  label,
  value,
  className,
  debounceTimeout,
  key,
  onChange,
  component
}) => {
  const [ inputValue, setInputValue ] = React.useState(value);
  const [ debounceTimer, setDebounceTimer ] = React.useState<NodeJS.Timeout | undefined>(undefined);
  const [ timerEvent, setTimerEvent ] = React.useState<React.ChangeEvent<HTMLInputElement> | undefined>(undefined);

  React.useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  /**
   * Update value with delay
   */
  const debouncedOnChange = () => {
    onChange && timerEvent && onChange(timerEvent);
    setTimerEvent(undefined);
  };

  /**
   * Event handler for text field value change
   *
   * @param event react change event
   */
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounceTimer && clearTimeout(debounceTimer);

    const newDebounceTimer = setTimeout(() => debouncedOnChange(), debounceTimeout ?? 500);

    setDebounceTimer(newDebounceTimer);
    event.persist();
    setTimerEvent(event);
    setInputValue(event.target.value);
  };

  return component({
    name: name,
    disabled: disabled,
    value: inputValue,
    className: className,
    key: key,
    label: label,
    onChange: onInputChange
  });
};

export default WithDebounce;