import { useMemo, useState } from 'react';

import { SUPPORTED_CHAINS, type SupportedChain } from '../constants/chains';
import { Dropdown, type DropdownOption } from './Dropdown';

interface NetworkSelectorProps {
  selectedChain?: SupportedChain;
  onNetworkSelect?: (chain: SupportedChain) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const NetworkSelector = ({
  selectedChain,
  onNetworkSelect,
  placeholder = 'Select Network',
  disabled = false,
  className = '',
}: NetworkSelectorProps) => {
  // Local UI-selected option so the trigger reflects the user's choice
  // immediately even before an external chain switch resolves.
  const [uiSelectedOption, setUiSelectedOption] = useState<DropdownOption<SupportedChain> | undefined>(
    undefined,
  );
  // Convert chains to dropdown options
  const options: DropdownOption<SupportedChain>[] = useMemo(
    () =>
      SUPPORTED_CHAINS.map((chain) => ({
        id: chain.chainId,
        label: chain.name,
        value: chain,
        icon: <img src={chain.icon} alt={chain.name} />,
        colorHex: chain.colorHex,
      })),
    []
  );

  // Find the selected option from props when wallet/network updates
  const selectedFromProps = useMemo(
    () =>
      selectedChain
        ? options.find((option) => option.value.chainId === selectedChain.chainId)
        : undefined,
    [selectedChain, options],
  );

  // Prefer the most recent UI choice; fall back to prop-derived value
  const selectedOption = uiSelectedOption ?? selectedFromProps;

  const handleSelect = (option: DropdownOption<SupportedChain>) => {
    setUiSelectedOption(option);
    onNetworkSelect?.(option.value);
  };

  return (
    <Dropdown
      options={options}
      selectedOption={selectedOption}
      onSelect={handleSelect}
      // Show friendly default when nothing selected, but do not force value
      placeholder={placeholder}
      disabled={disabled}
      className={`network-selector ${className}`}
    />
  );
};
