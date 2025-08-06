```abap
*&---------------------------------------------------------------------*
*& Include ZC103SDR0002TOP                          - Report ZC103SDR0002
*&---------------------------------------------------------------------*
REPORT zc103sdr0002 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103sdt0008, " 항공 스케줄 마스터
         zc103sdt0013, " 기내식 예약 정보
         zc103sdt0014. " 탑승객 정보

DATA: gs_grid_settings TYPE lvc_s_glay.

**********************************************************************
* DEFINE (RANGE 생성용)
**********************************************************************
DEFINE _ranges.
  &1-sign = &2.
  &1-option = &3.
  &1-low = &4.
  &1-high = &5.
  APPEND &1.
END-OF-DEFINITION.

**********************************************************************
* Class instance (ALV용 컨테이너 및 그리드)
**********************************************************************
DATA : go_container      TYPE REF TO cl_gui_docking_container,
       go_split_main     TYPE REF TO cl_gui_splitter_container,
       go_split_right    TYPE REF TO cl_gui_splitter_container,
       go_left_cont      TYPE REF TO cl_gui_container,
       go_right_cont     TYPE REF TO cl_gui_container,
       go_right_top_cont TYPE REF TO cl_gui_container,
       go_right_bot_cont TYPE REF TO cl_gui_container,
       go_top_grid       TYPE REF TO cl_gui_alv_grid,
       go_bottom_grid    TYPE REF TO cl_gui_alv_grid,
       go_right_bot_grid TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* Internal table and Work area
**********************************************************************

TYPES: BEGIN OF ty_schedule,
         scheduleid  TYPE zc103e_sd_scheduleid,
         flightid    TYPE zc103e_pm_acft_id,
         countryfrom TYPE zc103e_fi_land,
         countryto   TYPE zc103e_fi_land,
         departdate  TYPE zc103e_sd_date,
         departtime  TYPE zc103e_sd_time,
         arrivedate  TYPE zc103e_sd_arrdate,
         arrivetime  TYPE zc103e_sd_arrtime,
         flighttime  TYPE zc103e_sd_flighttime,
       END OF ty_schedule.

DATA : gt_schedule_list TYPE STANDARD TABLE OF ty_schedule,
       gs_schedule_list TYPE ty_schedule,

       BEGIN OF gs_dd07v,
         domvalue_l TYPE domvalue_l,
         ddtext     TYPE val_text,
       END OF gs_dd07v,
       gt_dd07v LIKE TABLE OF gs_dd07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l,

       BEGIN OF gs_disp_sch,
         scheduleid  TYPE zc103e_sd_scheduleid,
         flightid    TYPE zc103e_pm_acft_id,
         countryfrom TYPE string,
         countryto   TYPE string,
         departdate  TYPE zc103e_sd_date,
         departtime  TYPE zc103e_sd_time,
         arrivedate  TYPE zc103e_sd_arrdate,
         arrivetime  TYPE zc103e_sd_arrtime,
         flighttime  TYPE zc103e_sd_flighttime,
       END OF gs_disp_sch,
       gt_disp_sch LIKE TABLE OF gs_disp_sch.

TYPES: BEGIN OF ty_passenger,
         ticketid      TYPE zc103e_sd_ticketid,
         passengerid   TYPE zc103e_sd_passengerid,
         passengername TYPE zc103e_sd_passengername,
         seatcode      TYPE zc103e_sd_seatcode,
         mealid        TYPE zc103e_sd_mealid,
         mealtype      TYPE string,
         mealcount     TYPE zc103e_sd_mealcnt,
         status        TYPE zc103sdt0013-status,
       END OF ty_passenger.

DATA : gt_passenger_list TYPE STANDARD TABLE OF ty_passenger,
       gs_passenger_list TYPE ty_passenger,

       BEGIN OF gs_tt07v,
         domvalue_l TYPE domvalue_l,
         ddtext     TYPE val_text,
       END OF gs_tt07v,
       gt_tt07v LIKE TABLE OF gs_tt07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.

DATA : BEGIN OF gs_tisp_sch,
         ticketid      TYPE zc103e_sd_ticketid,
         icon          TYPE icon_d,
         passengerid   TYPE zc103e_sd_passengerid,
         passengername TYPE zc103e_sd_passengername,
         seatcode      TYPE zc103e_sd_seatcode,
         mealid        TYPE zc103e_sd_mealid,
         mealtype      TYPE string,
         mealcount     TYPE zc103e_sd_mealcnt,
         style         TYPE lvc_t_styl,
         status        TYPE zc103sdt0013-status, " ⬅️ 추가
       END OF gs_tisp_sch,
       gt_tisp_sch LIKE TABLE OF gs_tisp_sch.

**********************************************************************
* For ALV Field Catalog / Layout
**********************************************************************
DATA : gt_tfcat   TYPE lvc_t_fcat,
       gt_bfcat   TYPE lvc_t_fcat,
       gs_tfcat   TYPE lvc_s_fcat,
       gs_bfcat   TYPE lvc_s_fcat,
       gs_layout  TYPE lvc_s_layo,
       gs_variant TYPE disvariant.

DATA: gt_mfcat TYPE lvc_t_fcat,
      gs_mfcat TYPE lvc_s_fcat.

**********************************************************************
* Common variable
**********************************************************************
DATA: gv_okcode              TYPE sy-ucomm,
      gv_selected_scheduleid TYPE zc103e_sd_scheduleid,
      gv_screen_initialized  TYPE abap_bool VALUE abap_false.

**********************************************************************
* Meal Summary (우하단 ALV용)
**********************************************************************

TYPES: BEGIN OF ty_meal_summary,
         scheduleid    TYPE zc103e_sd_scheduleid,
         matid         TYPE zc103e_mm_matnr,
         matname       TYPE zc103e_mm_mname,
         totalcnt      TYPE i,
         meins         TYPE meins,
         totalamt      TYPE wrbtr,
         waers         TYPE waers,
         totalamt_disp TYPE i,
         status        TYPE zc103sdt0013-status,  " ⬅️ 선택적으로 추가 가능 (전체 상태)
       END OF ty_meal_summary.

DATA: gt_meal_summary TYPE STANDARD TABLE OF ty_meal_summary,
      gs_meal_summary TYPE ty_meal_summary,
      lt_summary      TYPE STANDARD TABLE OF ty_meal_summary WITH EMPTY KEY.

CONSTANTS: BEGIN OF gc_meal_map,
             a TYPE zc103e_mm_matnr VALUE 'MAT00045',
             b TYPE zc103e_mm_matnr VALUE 'MAT00046',
             c TYPE zc103e_mm_matnr VALUE 'MAT00041',
             d TYPE zc103e_mm_matnr VALUE 'MAT00042',
             e TYPE zc103e_mm_matnr VALUE 'MAT00043',
             f TYPE zc103e_mm_matnr VALUE 'MAT00044',
           END OF gc_meal_map.

DATA: go_top_cont   TYPE REF TO cl_gui_docking_container,
      go_html_cntrl TYPE REF TO cl_gui_html_viewer,
      go_dyndoc_id  TYPE REF TO cl_dd_document.

DATA: gv_top_message TYPE sdydo_text_element VALUE '항공편 스케쥴을 선택하세요.'.

DATA: gs_layout1 TYPE lvc_s_layo,
      gs_layout2 TYPE lvc_s_layo,
      gs_layout3 TYPE lvc_s_layo.

TYPES: BEGIN OF ty_sched,
         scheduleid TYPE zc103mmt0007-scheduleid,
       END OF ty_sched.

DATA: lt_existing_sched TYPE SORTED TABLE OF ty_sched WITH UNIQUE KEY scheduleid.

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758

