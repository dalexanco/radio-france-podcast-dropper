import React, { useState } from 'react';
import { Text, Box, useInput } from 'ink';

interface WizardOption {
  key: string;
  label: string;
  description: string;
  command: string;
  args?: string[];
  options?: Record<string, any>;
}

interface WizardProps {
  onSelect: (command: string, args?: string[], options?: Record<string, any>) => void;
}

const Wizard: React.FC<WizardProps> = ({ onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [step, setStep] = useState<'main' | 'search' | 'download' | 'subscribe' | 'subscriptions'>('main');

  const mainOptions: WizardOption[] = [
    {
      key: 'search',
      label: 'Search',
      description: 'Search for France Inter emissions',
      command: 'search',
    },
    {
      key: 'download',
      label: 'Download',
      description: 'Download episodes from an emission',
      command: 'download',
    },
    {
      key: 'subscribe',
      label: 'Subscribe',
      description: 'Subscribe to an emission',
      command: 'subscribe',
    },
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      description: 'Manage your subscriptions',
      command: 'subscriptions',
    },
  ];

  const subscriptionOptions: WizardOption[] = [
    {
      key: 'list',
      label: 'List',
      description: 'List all subscriptions',
      command: 'subscriptions-list',
    },
    {
      key: 'show',
      label: 'Show',
      description: 'Show subscription details',
      command: 'subscriptions-show',
    },
    {
      key: 'remove',
      label: 'Remove',
      description: 'Unsubscribe from an emission',
      command: 'subscriptions-remove',
    },
    {
      key: 'update',
      label: 'Update',
      description: 'Update subscriptions and check for new episodes',
      command: 'subscriptions-update',
    },
  ];

  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const currentOptions = step === 'main' ? mainOptions : subscriptionOptions;

  useInput((input: string, key: any) => {
    if (inputMode) {
      if (key.return) {
        if (step === 'search') {
          onSelect('search', [inputValue], {});
        } else if (step === 'download' || step === 'subscribe') {
          onSelect(step, [inputValue], {});
        } else if (step === 'subscriptions' && selectedIndex === 1) {
          // Show command needs emission ID
          onSelect('subscriptions-show', [inputValue]);
        } else if (step === 'subscriptions' && selectedIndex === 2) {
          // Remove command needs emission ID
          onSelect('subscriptions-remove', [inputValue]);
        }
        setInputMode(false);
        setInputValue('');
      } else if (key.backspace || key.delete) {
        setInputValue(prev => prev.slice(0, -1));
      } else if (!key.ctrl && !key.meta) {
        setInputValue(prev => prev + input);
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : currentOptions.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < currentOptions.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selected = currentOptions[selectedIndex];
      
      if (step === 'main') {
        if (selected.key === 'subscriptions') {
          setStep('subscriptions');
          setSelectedIndex(0);
        } else if (selected.key === 'search') {
          setStep('search');
          setInputMode(true);
          setInputValue('');
        } else if (selected.key === 'download' || selected.key === 'subscribe') {
          setStep(selected.key as 'download' | 'subscribe');
          setInputMode(true);
          setInputValue('');
        } else {
          onSelect(selected.command, selected.args, selected.options);
        }
      } else if (step === 'subscriptions') {
        if (selected.key === 'list' || selected.key === 'update') {
          onSelect(selected.command, selected.args, selected.options);
        } else {
          // show or remove need emission ID
          setInputMode(true);
          setInputValue('');
        }
      }
    } else if (key.escape) {
      if (step !== 'main') {
        setStep('main');
        setSelectedIndex(0);
        setInputMode(false);
        setInputValue('');
      }
    }
  });

  if (inputMode) {
    let prompt = '';
    if (step === 'search') {
      prompt = 'Enter search query: ';
    } else if (step === 'download') {
      prompt = 'Enter emission ID: ';
    } else if (step === 'subscribe') {
      prompt = 'Enter emission ID: ';
    } else if (step === 'subscriptions') {
      if (selectedIndex === 1) {
        prompt = 'Enter emission ID to show: ';
      } else if (selectedIndex === 2) {
        prompt = 'Enter emission ID to remove: ';
      }
    }

    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text color="cyan" bold>France Inter Podcast Dropper - Wizard</Text>
        </Box>
        <Box marginBottom={1}>
          <Text>{prompt}</Text>
          <Text color="green">{inputValue}</Text>
          <Text color="gray">_</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Press Enter to confirm, Esc to cancel</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="cyan" bold>France Inter Podcast Dropper - Wizard</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="gray">
          {step === 'main' 
            ? 'Select a command to get started:' 
            : 'Select a subscription action:'}
        </Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {currentOptions.map((option, index) => (
          <Box key={option.key} marginBottom={1}>
            <Text>
              {index === selectedIndex ? (
                <Text color="green">{'▶ '}</Text>
              ) : (
                <Text>{'  '}</Text>
              )}
              <Text 
                color={index === selectedIndex ? 'green' : 'white'}
                bold={index === selectedIndex}
              >
                {option.label}
              </Text>
              <Text color="gray"> - {option.description}</Text>
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={2} flexDirection="column">
        <Text color="gray">↑/↓: Navigate  Enter: Select  Esc: Back</Text>
      </Box>
    </Box>
  );
};

export default Wizard;

