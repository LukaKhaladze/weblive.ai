export type WidgetComponentProps = {
  props: Record<string, unknown>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoDataUrl?: string;
  };
  onPropChange: (key: string, value: unknown) => void;
};
