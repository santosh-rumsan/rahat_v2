import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Project Management',
    description: (
      <>
        Track disaster relief and development projects with budgets,
        beneficiary counts, and real-time status across all active operations.
      </>
    ),
  },
  {
    title: 'Digital Distribution',
    description: (
      <>
        Distribute aid via SMS, IVR, and QR/NFC tokens. Beneficiaries receive
        and redeem support through the channel that works best for them.
      </>
    ),
  },
  {
    title: 'Financial Oversight',
    description: (
      <>
        Manage treasury balances, allocate funds to projects, and track every
        transaction in real time with role-based access control.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
