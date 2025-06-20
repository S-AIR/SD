sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, Filter, FilterOperator, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("sync6.cl1.occubyflightid.controller.OccurateByFlightId", {
      onInit() {
        // 모델이 완전히 로딩된 후 실행
        const oView = this.getView();
        const oModel = oView.getModel();

        if (!oModel) {
          oView.attachModelContextChange(() => {
            this._loadChartData("2025");
          });
        } else {
          this._loadChartData("2025");
        }
      },

      onYearChange: function (oEvent) {
        const sYear = oEvent.getSource().getSelectedKey();
        this._loadChartData(sYear);
        this.byId("reportTitle").setText(`${sYear}년 항공 운항 실적 분석 리포트`);
      },

      _loadChartData: function (sYear) {
        const oVizFrame1 = this.byId("ByFlightid");
        const oVizFrame2 = this.byId("ByRoute");
        const oModel = this.getView().getModel(); // OData 모델은 manifest에서 설정된 기본 모델 사용
        if (!oModel) {
          console.error("OData 모델이 로드되지 않았습니다.");
          return;
        }

        // 필터 객체 구성
        const aFilters = [new Filter("PerformYear", FilterOperator.EQ, sYear)];
        oModel.setUseBatch(false);

        // 항공기별
        oModel.read("/OccByFlightSet", {
          filters: aFilters,
          success: function (oData) {
            const oJsonModel = new JSONModel(oData.results);
            oVizFrame1.setModel(oJsonModel, "chartModel");
          },
          error: function () {
            MessageToast.show("Flight data 조회 실패");
          },
        });

        // 노선별
        oModel.read("/OccByRouteSet", {
          filters: aFilters,
          success: function (oData) {
            const oJsonModel = new JSONModel(oData.results);
            oVizFrame2.setModel(oJsonModel, "chartModelRoute");
          },
          error: function () {
            MessageToast.show("Route data 조회 실패");
          },
        });

        // 분기별
        oModel.read("/OccByPeriodSet", {
          filters: aFilters,
          success: (oData) => {
            const oJsonModel = new JSONModel(oData.results);
            this.byId("ByPeriod").setModel(oJsonModel, "chartModelPeriod");
          },
          error: () => MessageToast.show("Period data 조회 실패"),
        });

        // Top 10, Bottom 10
        // 필터 객체 구성
        const topFilters = [
          new Filter("PerformYear", FilterOperator.EQ, sYear),
          new Filter("RankType", FilterOperator.EQ, "Top"),
        ];
        const bottomFilters = [
          new Filter("PerformYear", FilterOperator.EQ, sYear),
          new Filter("RankType", FilterOperator.EQ, "Bottom"),
        ];
        oModel.read("/ScheduleSet", {
          filters: topFilters,
          success: (oData) => {
            const oTopModel = new JSONModel(oData.results);
            this.byId("topTable").setModel(oTopModel, "topModel");
          },
          error: () => MessageToast.show("상위 10개 데이터 조회 실패"),
        });

        oModel.read("/ScheduleSet", {
          filters: bottomFilters,
          success: (oData) => {
            const oBottomModel = new JSONModel(oData.results);
            this.byId("bottomTable").setModel(oBottomModel, "bottomModel");
          },
          error: () => MessageToast.show("상위 10개 데이터 조회 실패"),
        });
      },

      _loadRouteChartData: function (sYear) {
        const oVizFrame = this.byId("ByRoute");
        const oModel = this.getView().getModel();
        if (!oModel) return;

        const aFilters = [new Filter("PerformYear", FilterOperator.EQ, sYear)];
        oModel.setUseBatch(false);

        oModel.read("/OccByRouteSet", {
          filters: aFilters,
          success: function (oData) {
            const oJsonModel = new JSONModel(oData.results);
            oVizFrame.setModel(oJsonModel, "chartModelRoute");
          },
          error: function () {
            MessageToast.show("노선별 데이터를 불러오는 데 실패했습니다.");
          },
        });
      },

      _loadPeriodChartData: function (sYear) {
        const oVizFrame = this.byId("ByPeriod");
        const oModel = this.getView().getModel();
        if (!oModel) return;

        const aFilters = [new Filter("PerformYear", FilterOperator.EQ, sYear)];

        oModel.read("/OccByPeriodSet", {
          filters: aFilters,
          success: (oData) => {
            const oJsonModel = new JSONModel(oData.results);
            this.getView().setModel(oJsonModel, "chartModelPeriod");
          },
          error: () => MessageToast.show("Period data 조회 실패"),
        });
      },
    });
  }
);
