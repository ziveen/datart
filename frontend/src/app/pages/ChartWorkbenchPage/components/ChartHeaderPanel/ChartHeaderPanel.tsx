/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import SaveToDashboard from 'app/components/SaveToDashboard';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import useMount from 'app/hooks/useMount';
import { backendChartSelector } from 'app/pages/ChartWorkbenchPage/slice/workbenchSlice';
import { DownloadListPopup } from 'app/pages/MainPage/Navbar/DownloadListPopup';
import { loadTasks } from 'app/pages/MainPage/Navbar/service';
import { selectHasVizFetched } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import { getFolders } from 'app/pages/MainPage/pages/VizPage/slice/thunks';
import { useMainSlice } from 'app/pages/MainPage/slice';
import { selectDownloadPolling } from 'app/pages/MainPage/slice/selectors';
import { downloadFile } from 'app/utils/fetch';
import { FC, memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import {
  FONT_SIZE_ICON_SM,
  FONT_WEIGHT_MEDIUM,
  LINE_HEIGHT_ICON_SM,
  SPACE_MD,
  SPACE_SM,
  SPACE_TIMES,
  SPACE_XS,
} from 'styles/StyleConstants';

const ChartHeaderPanel: FC<{
  chartName?: string;
  orgId?: string;
  container?: string;
  onSaveChart?: () => void;
  onGoBack?: () => void;
  onSaveChartToDashBoard?: (dashboardId, dashboardType) => void;
}> = memo(
  ({
    chartName,
    orgId,
    container,
    onSaveChart,
    onGoBack,
    onSaveChartToDashBoard,
  }) => {
    const t = useI18NPrefix(`viz.workbench.header`);
    const hasVizFetched = useSelector(selectHasVizFetched);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const backendChart = useSelector(backendChartSelector);
    const downloadPolling = useSelector(selectDownloadPolling);
    const dispatch = useDispatch();
    const { actions } = useMainSlice();

    const handleModalOk = useCallback(
      (dashboardId: string, dashboardType: string) => {
        onSaveChartToDashBoard?.(dashboardId, dashboardType);
        setIsModalVisible(true);
      },
      [onSaveChartToDashBoard],
    );

    const handleModalCancel = useCallback(() => {
      setIsModalVisible(false);
    }, []);

    const onSetPolling = useCallback(
      (polling: boolean) => {
        dispatch(actions.setDownloadPolling(polling));
      },
      [dispatch, actions],
    );

    useMount(() => {
      if (!hasVizFetched) {
        // Request data when there is no data
        dispatch(getFolders(orgId as string));
      }
    });
    return (
      <Wrapper>
        <h1>{chartName}</h1>
        <Space>
          <DownloadListPopup
            polling={downloadPolling}
            setPolling={onSetPolling}
            onLoadTasks={loadTasks}
            onDownloadFile={item => {
              if (item.id) {
                downloadFile(item.id).then(() => {
                  dispatch(actions.setDownloadPolling(true));
                });
              }
            }}
            renderDom={
              <Button type="primary" ghost icon={<DownloadOutlined />}>
                {t('downloadList')}
              </Button>
            }
          />
          <Button type="primary" ghost onClick={onGoBack}>
            {t('cancel')}
          </Button>
          <Button type="primary" onClick={onSaveChart}>
            {t('save')}
          </Button>
          {!(container === 'widget') && (
            <Button
              type="primary"
              onClick={() => {
                setIsModalVisible(true);
              }}
            >
              {t('saveToDashboard')}
            </Button>
          )}
          <SaveToDashboard
            orgId={orgId as string}
            title={t('saveToDashboard')}
            isModalVisible={isModalVisible}
            handleOk={handleModalOk}
            handleCancel={handleModalCancel}
            backendChartId={backendChart?.id}
          ></SaveToDashboard>
        </Space>
      </Wrapper>
    );
  },
);

export default ChartHeaderPanel;

const Wrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: ${SPACE_SM} ${SPACE_MD} ${SPACE_SM} ${SPACE_SM};
  border-bottom: 1px solid ${p => p.theme.borderColorSplit};

  h1 {
    flex: 1;
    padding: 0 ${SPACE_XS};
    font-size: ${FONT_SIZE_ICON_SM};
    font-weight: ${FONT_WEIGHT_MEDIUM};
    line-height: ${LINE_HEIGHT_ICON_SM};
  }
`;

const GoBack = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${SPACE_TIMES(8)};
  height: ${SPACE_TIMES(8)};
  font-size: ${FONT_SIZE_ICON_SM};
  color: ${p => p.theme.textColorLight};

  &:hover {
    color: ${p => p.theme.textColorSnd};
  }
`;
