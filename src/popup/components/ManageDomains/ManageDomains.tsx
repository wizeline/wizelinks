import { useState } from 'react';
import getCSVFromEntries from '../../utils/getCSVFromEntries';
import DomainList from '../DomainList';
import DomainForm from '../DomainForm';
import getBrowserAPIs from '../../../background/api/web-extension';
import { domainMessageCreators, shortLinkMessageCreators } from '../../../shared/messages';
import proxy from '../Notification/proxy';

const browserAPIs = getBrowserAPIs();

const ManageDomains = () => {
  const [currentDomainEntry, setCurrentDomainEntry] = useState<DomainEntry | undefined>();

  const onAddDomain = async (domainEntry: DomainEntry) => {
    await browserAPIs.runtime.sendMessage(domainMessageCreators.upsert(domainEntry));
    setCurrentDomainEntry(undefined);
    proxy.setNotification({
      type: 'success',
      message: `Domain ${domainEntry.domain} successfully added`,
    });
  };

  const onEditDomain = async (domainEntry: DomainEntry) => {
    setCurrentDomainEntry(domainEntry);
  };

  const onDeleteDomain = async (domain: string) => {
    await browserAPIs.runtime.sendMessage(domainMessageCreators.delete(domain));
    proxy.setNotification({
      type: 'success',
      message: `Domain ${domain} successfully deleted`,
    });
  };

  const onDownload = async (domain: string) => {
    const results = await browserAPIs.runtime.sendMessage(
      shortLinkMessageCreators.search({ domain })
    );
    const csv = getCSVFromEntries(results.shortLinkEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${domain}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <DomainForm
        title="Register Domain"
        onAction={onAddDomain}
        buttonLabel={currentDomainEntry ? 'Update Domain' : 'Add Domain'}
        defaultValues={currentDomainEntry}
      />
      <DomainList onEdit={onEditDomain} onDelete={onDeleteDomain} onDownload={onDownload} />
    </>
  );
};

export default ManageDomains;
