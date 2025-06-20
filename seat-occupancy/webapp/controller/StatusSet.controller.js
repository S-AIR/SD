sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("sync6.cl1.seatoccupancy.controller.StatusSet", {
      onInit: function () {
        // init
        this._pageSize = 50;
        this._currentPage = 1;
        this._editMode = false;

        // ODataModel 설정 (statusTable용)
        const oODataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZC103SDCDS_R_0001/");
        this.getView().setModel(oODataModel);

        // seatTable용 빈 JSONModel 초기화
        const oSeatModel = new sap.ui.model.json.JSONModel({ seats: [] });
        this.getView().setModel(oSeatModel, "seatModel");

        const oView = this.getView();

        // 📅 이번 달 1일 ~ 말일 계산
        const oToday = new Date();
        const oFirstDate = new Date(oToday.getFullYear(), oToday.getMonth(), 1);
        const oLastDate = new Date(oToday.getFullYear(), oToday.getMonth() + 1, 0); // 다음달 0일 = 이번달 말일

        // DateRangeSelection 초기화 (UI에 날짜도 표시됨)
        const oDateRange = oView.byId("FlightDateRange");
        oDateRange.setDateValue(oToday);
        oDateRange.setSecondDateValue(oLastDate);

        // 📋 테이블 자동 필터 적용
        const oBinding = oView.byId("statusTable").getBinding("items");
        const aInitialFilters = [new Filter("DepartDate", sap.ui.model.FilterOperator.BT, oToday, oLastDate)];

        if (oBinding) {
          oBinding.filter(aInitialFilters);
        } else {
          console.warn("Table binding is not yet available.");
        }

        // 드롭다운용 국가 코드 리스트
        const oCountryModel = new JSONModel({
          SelectedFrom: "", // 기본 선택값
          SelectedTo: "",
          CountryList: [
            { code: "", name: "전체" },
            { code: "00", name: "대한민국(인천)" },
            { code: "01", name: "대한민국(부산/김해)" },
            { code: "02", name: "오스트레일리아(시드니)" },
            { code: "03", name: "베트남(하노이)" },
            { code: "04", name: "아랍에미리트(두바이)" },
            { code: "05", name: "독일(프랑크푸르트)" },
            { code: "06", name: "미국(LA)" },
          ],
        });

        oView.setModel(oCountryModel, "countryModel");
      },

      onFlightSelect: function (oEvent) {
        const oSelectedItem = oEvent.getSource().getSelectedItem();
        const sScheduleId = oSelectedItem.getBindingContext().getProperty("ScheduleId");

        const oModel = this.getView().getModel(); // ODataModel
        const oSeatModel = this.getView().getModel("seatModel");

        oModel.read("/SeatSet", {
          filters: [new sap.ui.model.Filter("Scheduleid", "EQ", sScheduleId)],
          urlParameters: { $top: "1000" },
          success: (oData) => {
            const aSeats = oData.results;
            const iPageSize = 50; // 원하는 page size 설정

            oSeatModel.setProperty("/SeatSet", aSeats);
            oSeatModel.setProperty("/pageSize", iPageSize);
            oSeatModel.setProperty("/page", 1);
            // oSeatModel.setProperty("/SeatSet", oData.results);
            oSeatModel.setProperty("/title", `${sScheduleId} 항공편 좌석 목록`);

            this._updatePagedSeats();
            this._updateGroupedSeats();

            this.byId("addSeatButton").setEnabled(true); // "좌석 추가" 버튼 활성화
          },
          error: function () {
            MessageToast.show("좌석 데이터를 불러오는 데 실패했습니다.");
          },
        });
      },

      _updatePagedSeats: function () {
        const oSeatModel = this.getView().getModel("seatModel");

        const aSeats = oSeatModel.getProperty("/SeatSet") || [];
        // const iPage = oSeatModel.getProperty("/page") || 1;
        const iPageSize = oSeatModel.getProperty("/pageSize") || 20;

        const iTotalPages = Math.ceil(aSeats.length / iPageSize) || 1;

        // ✅ 현재 페이지 유효성 강제 보정 (이 안에서 항상 보정 → 어디서 호출하든 안정성 확보)
        if (this._currentPage > iTotalPages) {
          this._currentPage = iTotalPages;
        }
        if (this._currentPage < 1) {
          this._currentPage = 1;
        }

        const iPage = this._currentPage;

        const iStartIndex = (iPage - 1) * iPageSize;
        const iEndIndex = iStartIndex + iPageSize;

        const aPagedSeats = aSeats.slice(iStartIndex, iEndIndex);

        oSeatModel.setProperty("/pagedSeats", aPagedSeats);

        // 페이지 정보 텍스트 업데이트
        // const iTotalPages = Math.ceil(aSeats.length / iPageSize) || 1;
        oSeatModel.setProperty("/pageText", `${iPage} / ${iTotalPages}`);
      },

      onPrevPage: function () {
        const oSeatModel = this.getView().getModel("seatModel");
        let iPage = oSeatModel.getProperty("/page") || 1;

        if (iPage > 1) {
          iPage--;
          this._currentPage = iPage; // 동기화
          oSeatModel.setProperty("/page", iPage);
          this._updatePagedSeats();
        }
      },

      onNextPage: function () {
        const oSeatModel = this.getView().getModel("seatModel");
        const aSeats = oSeatModel.getProperty("/SeatSet") || [];
        const iPageSize = oSeatModel.getProperty("/pageSize") || 20;
        const iTotalPages = Math.ceil(aSeats.length / iPageSize) || 1;

        let iPage = oSeatModel.getProperty("/page") || 1;

        if (iPage < iTotalPages) {
          iPage++;
          this._currentPage = iPage; // 동기화
          oSeatModel.setProperty("/page", iPage);
          this._updatePagedSeats();
        }
      },

      onSearch: function () {
        // seatTable용 빈 JSONModel 초기화
        const oSeatModel = new sap.ui.model.json.JSONModel({ seats: [] });
        this.getView().setModel(oSeatModel, "seatModel");

        const oView = this.getView();
        const aFilters = [];

        // ✅ 1. 드롭다운에서 선택된 출발지 / 도착지
        const sFrom = oView.byId("countryFrom").getSelectedKey(); // 예: "01"
        const sTo = oView.byId("countryTo").getSelectedKey();

        // ✅ 2. 날짜 범위 선택
        const oDateRange = this.byId("FlightDateRange").getDateValue();
        const oDateRangeTo = this.byId("FlightDateRange").getSecondDateValue();

        // 🌏 출발지 필터
        if (sFrom) {
          aFilters.push(new Filter("Countryfrom", FilterOperator.EQ, sFrom));
        }

        // 🛬 도착지 필터
        if (sTo) {
          aFilters.push(new Filter("Countryto", FilterOperator.EQ, sTo));
        }

        // ⏱️ 출발일자 필터 (기간)
        if (oDateRange && oDateRangeTo) {
          aFilters.push(new Filter("DepartDate", FilterOperator.BT, oDateRange, oDateRangeTo));
        }

        // ✅ 결과 테이블에 필터 적용
        const oTable = this.byId("statusTable");
        oTable.getBinding("items").filter(aFilters);
      },

      // formatStatusIconColor: function (sStatus) {
      //   switch (sStatus) {
      //     case "empty":
      //       return "Positive"; // 파랑색
      //     case "low":
      //       return "Positive"; // 초록색
      //     case "normal":
      //       return "Critical"; // 노란색
      //     // case "high":
      //     //   return "Negative"; // 빨간색
      //     default:
      //       return "Neutral";
      //   }
      // },

      formatStatusText: function (sStatus) {
        switch (sStatus) {
          case "empty":
            return "매우 여유";
          case "low":
            return "여유";
          case "normal":
            return "보통";
          case "high":
            return "매진 임박";
          case "soldout":
            return "매진";
          default:
            return sStatus;
        }
      },

      formatStatusCircleClass: function (sStatus) {
        switch (sStatus) {
          case "empty":
            return "circleBlue";
          case "low":
            return "circleGreen";
          case "normal":
            return "circleYellow";
          case "high":
            return "circleRed";
          case "soldout":
            return "circleGrey";
          default:
            return "circleGrey";
        }
      },

      formatDateOnly: function (oDate) {
        if (!oDate) {
          return "";
        }

        // oDate가 string(YYYYMMDD) 인 경우 처리 → CDS View에서 string으로 넘어오는 경우가 많음
        if (typeof oDate === "string" && oDate.length === 8) {
          return oDate.substring(0, 4) + "-" + oDate.substring(4, 6) + "-" + oDate.substring(6, 8);
        }

        // oDate가 JS Date object 인 경우
        if (oDate instanceof Date) {
          var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "yyyy-MM-dd",
          });
          return oDateFormat.format(oDate);
        }

        return oDate; // fallback
      },

      formatCountryName: function (sCode) {
        if (!sCode) {
          return "";
        }

        // sCode가 "0", "1", ... 처럼 오면 → "00", "01" 로 변환
        var sPaddedCode = sCode.toString().padStart(2, "0");

        // CountryList 모델 참조
        var oCountryModel = this.getView().getModel("countryModel");
        var aCountryList = oCountryModel.getProperty("/CountryList");

        // 코드 → 이름 매핑 찾기
        var oMatch = aCountryList.find(function (oItem) {
          return oItem.code === sPaddedCode;
        });

        return oMatch ? oMatch.name : sCode; // 못 찾으면 코드 그대로 표시
      },

      onSaveSeat: function () {
        const oModel = this.getView().getModel();

        const sScheduleid = this._currentScheduleId;
        const sSeatcode = this.byId("seatCodeInput").getValue();
        const sAssigned = this.byId("assignedSelect").getSelectedKey();
        const sTicketID = this.byId("ticketIdInput").getValue();
        const sPassengerName = this.byId("passengerNameInput").getValue();
        const sMealtype = this.byId("mealtypeInput").getValue;

        const sPath = `/SeatSet(Scheduleid='${sScheduleid}',Seatcode=${parseInt(sSeatcode, 10)})`;

        oModel.update(
          sPath,
          {
            Assigned: sAssigned,
            TicketID: sTicketID,
          },
          {
            success: function () {
              sap.m.MessageToast.show("좌석 정보가 수정되었습니다.");
              this.byId("seatEditDialog").close();
              this._refreshSeatTable();
            }.bind(this),
            error: function (oError) {
              sap.m.MessageToast.show("수정 실패: " + oError.message);
            },
          }
        );
      },

      _refreshSeatTable: function () {
        const oSelectedItem = this.getView().byId("statusTable").getSelectedItem();

        if (!oSelectedItem) {
          return;
        }

        const sScheduleId = oSelectedItem.getBindingContext().getProperty("ScheduleId");

        const oModel = this.getView().getModel();
        const oSeatModel = this.getView().getModel("seatModel");

        oModel.read("/SeatSet", {
          filters: [new sap.ui.model.Filter("Scheduleid", "EQ", sScheduleId)],
          urlParameters: {
            $top: 1000,
          },
          success: (oData) => {
            // this._currentPage = 1;
            // oSeatModel.setProperty("/SeatSet", oData.results);
            // oSeatModel.setProperty("/pagedSeats", oData.results.slice(0, this._pageSize));
            // this.byId("seatTable").getBinding("items").refresh();

            // 전체 페이지 수 계산
            const iTotalPages = Math.ceil(oData.results.length / this._pageSize) || 1;

            // 현재 페이지 유효성 체크
            if (this._currentPage > iTotalPages) {
              this._currentPage = iTotalPages;
            }

            // SeatSet 갱신
            oSeatModel.setProperty("/SeatSet", oData.results);

            // pagedSeats 자동 갱신
            this._updatePagedSeats();

            // 추가: 좌석 배치도 groupedSeats 갱신
            this._updateGroupedSeats();

            // 페이지 정보 갱신
            // oSeatModel.setProperty("/pageText", `${this._currentPage} / ${iTotalPages}`);
          },
          error: function () {
            sap.m.MessageToast.show("좌석 데이터를 다시 가져오는 데 실패했습니다.");
          },
        });
      },

      onCancel: function (dialog) {
        this.byId(dialog).close();
      },

      onOpenSeatCreateDialog: function () {
        // 항공편 ID 세팅 (변경 불가)
        const oSelectedItem = this.byId("statusTable").getSelectedItem(); // 현재 선택된 항공편
        const sScheduleId = oSelectedItem.getBindingContext().getProperty("ScheduleId");

        // 필드 세팅
        this.byId("createSchidInput").setValue(sScheduleId);
        this.byId("createSeatCodeInput").setValue("");
        this.byId("createAssignedSelect").setSelectedKey("N");

        this.byId("seatCreateDialog").open();
      },

      // 좌석 생성
      onCreateSeat: function () {
        const oModel = this.getView().getModel();

        const sSeatcode = this.byId("createSeatCodeInput").getValue();
        const sAssigned = this.byId("createAssignedSelect").getSelectedKey();
        const sScheduleid = this.byId("createSchidInput").getValue();

        if (sScheduleid == "") {
          sap.m.MessageToast.show("좌석 코드 입력은 필수입니다.");
        }
        oModel.create(
          "/SeatSet",
          {
            Scheduleid: sScheduleid,
            Seatcode: parseInt(sSeatcode, 10), // Seatcode INT 타입임
            Assigned: sAssigned,
          },
          {
            success: () => {
              sap.m.MessageToast.show("좌석이 생성되었습니다.");
              this.byId("seatCreateDialog").close();
              this._refreshSeatTable();
            },
            error: (oError) => {
              sap.m.MessageToast.show("좌석 생성 실패: " + oError.message);
            },
          }
        );
      },

      onDeleteSeat: function () {
        const sScheduleid = this._currentScheduleId;
        const sSeatcode = this.byId("seatCodeInput").getValue();

        // Confirm Dialog 띄우기
        sap.m.MessageBox.confirm("정말로 좌석을 삭제하시겠습니까?", {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: (sAction) => {
            if (sAction === sap.m.MessageBox.Action.YES) {
              const oModel = this.getView().getModel();

              const sPath = `/SeatSet(Scheduleid='${sScheduleid}',Seatcode=${parseInt(sSeatcode, 10)})`;

              oModel.remove(sPath, {
                success: () => {
                  sap.m.MessageToast.show("좌석이 삭제되었습니다.");
                  this.byId("seatEditDialog").close();
                  this._refreshSeatTable();
                },
                error: (oError) => {
                  sap.m.MessageToast.show("좌석 삭제 실패: " + oError.message);
                },
              });
            }
          },
        });
      },

      // 좌석 선택 for 좌석 수정
      onSeatPress: function (oEvent) {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("seatModel");
        const oData = oContext.getObject();
        let mealtypeText = this.switchMealtype(oData.Mealtype);

        // Dialog 열기
        const oDialog = this.byId("seatEditDialog");

        // 기존 데이터 Dialog에 세팅
        this.byId("seatCodeInput").setValue(oData.Seatcode);
        this.byId("assignedSelect").setSelectedKey(oData.Assigned);
        this.byId("ticketIdInput").setValue(oData.TicketID);
        this.byId("passengerNameInput").setValue(oData.Passengername);
        this.byId("mealtypeInput").setValue(mealtypeText);

        // 현재 선택된 Scheduleid → Dialog 저장 시 필요하므로 저장
        this._currentScheduleId = oData.Scheduleid;

        // 🔒 모두 읽기 전용으로 설정
        this.byId("assignedSelect").setEnabled(false);
        this.byId("ticketIdInput").setEditable(false);

        // ✨ 조회 모드 상태 저장
        this._editMode = false;

        // 버튼 상태 조정
        this.byId("editButton").setVisible(true);
        this.byId("saveButton").setVisible(false);
        this.byId("deleteButton").setVisible(false);

        this.byId("seatEditDialog").open();

        oDialog.open();
      },

      // 좌석 선택 시 화면에 필요한 기내식 코트 변환
      switchMealtype: function (params) {
        let mealtypeText = "";
        switch (params) {
          case "A":
            mealtypeText = "이코노미-닭고기 덮밥";
            break;
          case "B":
            mealtypeText = "이코노미-크림 파스타";
            break;
          case "C":
            mealtypeText = "프레스티지-스테이크 밀";
            break;
          case "D":
            mealtypeText = "프레스티지-한식 반상";
            break;
          case "E":
            mealtypeText = "프레스티지-연어 플래터";
            break;
          case "F":
            mealtypeText = "프레스티지-채식 샐러드 밀";
            break;
          default:
            mealtypeText = "선택없음";
            break;
        }
        return mealtypeText;
      },

      _updateGroupedSeats: function () {
        const oSeatModel = this.getView().getModel("seatModel");
        const aSeats = oSeatModel.getProperty("/SeatSet") || [];
        const iSeatsPerRow = 6;

        const aGroupedSeats = [];

        for (let i = 0; i < aSeats.length; i += iSeatsPerRow) {
          aGroupedSeats.push(aSeats.slice(i, i + iSeatsPerRow));
        }

        oSeatModel.setProperty("/groupedSeats", aGroupedSeats);
      },

      onEditSeat: function () {
        this.byId("assignedSelect").setEnabled(true);
        this.byId("ticketIdInput").setEditable(true);

        this._editMode = true;

        // 버튼 상태 전환
        this.byId("editButton").setVisible(false);
        this.byId("saveButton").setVisible(true);
        this.byId("deleteButton").setVisible(true);
      },
    });
  }
);
