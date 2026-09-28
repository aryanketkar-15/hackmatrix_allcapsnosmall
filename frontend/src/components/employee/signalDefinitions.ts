import type { SignalIdT } from '../../types/contract';

/** P1–P10: privilege-misuse signals. They flag misuse of VALID access; they are signals, not findings of intent. */
export const SIGNALS: Record<SignalIdT, { short: string; definition: string }> = {
  P1: { short: 'Self-created authorization', definition: 'The supporting ticket or artifact was created by the same credential, or after the change (post-hoc).' },
  P2: { short: 'Outside portfolio', definition: 'The action targets an account outside the credential’s assigned portfolio.' },
  P3: { short: 'Off-shift activity', definition: 'The action happened outside the shift or attendance window of the credential’s owner.' },
  P4: { short: 'Rare for role', definition: 'The action is rare among peers in the same role (smoothed frequency baseline).' },
  P5: { short: 'High pair lift', definition: 'The maker–checker pair occurs far more often than expected by chance (pair lift).' },
  P6: { short: 'Fast approval', definition: 'The checker approved within seconds, with no independent review recorded.' },
  P7: { short: 'Permission override', definition: 'A permission override or delegation was used to complete the action.' },
  P8: { short: 'Shared terminal', definition: 'Multiple credentials acted from the same terminal or device around the same time.' },
  P9: { short: 'Dormant / senior target', definition: 'The action targets a dormant or senior-citizen account.' },
  P10: { short: 'Recent permission change', definition: 'A permission or role change shortly preceded the activity.' },
};

export const SIGNAL_DISCLAIMER = 'Signal level, not a finding of intent.';
