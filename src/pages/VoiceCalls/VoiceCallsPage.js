import React, { useState } from "react";
import { Box } from "@mui/material";
import { Tabs, Spin, Card, Empty } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { PALETTE } from "../../theme/palette";

import useVoiceConfiguration from "../../hooks/useVoiceConfiguration";
import useVoiceDashboard from "../../hooks/useVoiceDashboard";
import useVoiceCalls from "../../hooks/useVoiceCalls";

import VoiceKPICards from "../../components/VoiceKPICards";
import VoiceDashboardTable from "../../components/VoiceDashboardTable";
import VoiceSetupForm from "../../components/VoiceSetupForm";
import VoiceConfigurationForm from "../../components/VoiceConfigurationForm";
import VoiceCallLogsTable from "../../components/VoiceCallLogsTable";
import MakeCallForm from "../../components/MakeCallForm";

/**
 * Voice Calls module entry page. Mirrors the WhatsApp module's behaviour:
 * shows only the setup form until a Voice configuration exists for the
 * organization, then switches to KPI cards + tabs (Call Logs / Make Call /
 * Configuration).
 */
const VoiceCallsPage = () => {
  const orgId = localStorage.getItem("selectedOrgId");

  const {
    configuration,
    hasConfiguration,
    loading: configLoading,
    saving: configSaving,
    saveConfiguration,
  } = useVoiceConfiguration(orgId);

  const {
    dashboard,
    loading: dashboardLoading,
    fetchDashboard,
    extended: dashboardExtended,
    extendedLoading: dashboardExtendedLoading,
    fetchExtendedDashboard,
  } = useVoiceDashboard(orgId, { enabled: hasConfiguration });

  const {
    logs,
    loading: callsLoading,
    creating: callCreating,
    filters,
    pagination,
    applyFilters,
    applySorter,
    changePage,
    createCall,
    fetchCalls,
  } = useVoiceCalls(orgId);

  const [activeTab, setActiveTab] = useState("logs");

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "logs") fetchCalls();
  };

  const handleCreateCall = async (payload) => {
    const result = await createCall(payload);
    fetchDashboard();
    return result;
  };

  const enabledNumbers = (configuration?.phoneNumbers || []).filter(
    (n) => n.status === "ENABLED"
  );
  const fromNumberOptions = (configuration?.phoneNumbers || []).map((n) => n.phone_number);

  if (!orgId) {
    return (
      <div className="p-10">
        <Empty description="Select an organization to manage Voice Calls" />
      </div>
    );
  }

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!hasConfiguration) {
    return <VoiceSetupForm onSubmit={saveConfiguration} saving={configSaving} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        minWidth: 0,
        background: PALETTE.surface,
      }}
    >
      <div className="min-w-0 w-full flex-1 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <h1 className="m-0 shrink-0 text-xl font-bold text-gw-primary-dark sm:text-2xl lg:text-3xl">
            <PhoneOutlined className="mr-2" />
            Voice Calls
          </h1>
        </div>

        <VoiceKPICards
          kpis={dashboard.kpis}
          loading={dashboardLoading}
          extended={dashboardExtended}
          extendedLoading={dashboardExtendedLoading}
          onViewMore={fetchExtendedDashboard}
        />
        <VoiceDashboardTable numberStats={dashboard.numberStats} loading={dashboardLoading} />

        <Card className="shadow-sm border border-gray-100 rounded-xl">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            size="large"
            items={[
              {
                key: "logs",
                label: "Call Logs",
                children: (
                  <VoiceCallLogsTable
                    orgId={orgId}
                    logs={logs}
                    loading={callsLoading}
                    pagination={pagination}
                    filters={filters}
                    onFilterChange={applyFilters}
                    onSorterChange={applySorter}
                    onPageChange={changePage}
                    fromNumberOptions={fromNumberOptions}
                  />
                ),
              },
              {
                key: "makeCall",
                label: "Make Call",
                children: (
                  <MakeCallForm
                    orgId={orgId}
                    enabledNumbers={enabledNumbers}
                    onCreateCall={handleCreateCall}
                    creating={callCreating}
                  />
                ),
              },
              {
                key: "configuration",
                label: "Configuration",
                children: (
                  <VoiceConfigurationForm
                    configuration={configuration}
                    onSubmit={saveConfiguration}
                    saving={configSaving}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>
    </Box>
  );
};

export default VoiceCallsPage;
