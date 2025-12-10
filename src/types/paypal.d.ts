declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: {
          shape?: string;
          color?: string;
          layout?: string;
          label?: string;
        };
        createSubscription?: (data: any, actions: any) => Promise<string>;
        onApprove?: (data: any, actions: any) => void;
      }) => {
        render: (container: HTMLElement) => void;
      };
    };
  }
}

export {};
