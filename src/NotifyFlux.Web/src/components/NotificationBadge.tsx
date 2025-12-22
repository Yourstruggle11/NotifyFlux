type Props = {
  readonly count: number;
};

export const NotificationBadge = ({ count }: Props): JSX.Element => (
  <span className="notification-badge">
    {count}
  </span>
);
