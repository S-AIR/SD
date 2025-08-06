```abap
*&---------------------------------------------------------------------*
*& Include ZC103SDR0001TOP                          - Report ZC103SDR0001
*&---------------------------------------------------------------------*
REPORT zc103sdr0005 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103sdt0008, zc103sdt0012, zc103sdt0014.

**********************************************************************
* Internal table and work area
**********************************************************************
DATA: go_picture_container TYPE REF TO cl_gui_custom_container,
      go_picture_control   TYPE REF TO cl_gui_picture.
DATA : BEGIN OF gs_schedule,
         scheduleid  TYPE zc103sdt0008-scheduleid,
         countryfrom TYPE string,
         countryto   TYPE string,
         departdate  TYPE zc103sdt0008-departdate,
         departtime  TYPE zc103sdt0008-departtime,
         arrivedate  TYPE zc103sdt0008-arrivedate,
         arrivetime  TYPE zc103sdt0008-arrivetime,
       END OF gs_schedule,
       gt_schedule LIKE TABLE OF gs_schedule.

DATA : BEGIN OF gs_service,
         status        TYPE zc103sdt0012-status,
         ticketid      TYPE zc103sdt0012-ticketid,
         souvenirid    TYPE zc103sdt0012-souvenirid,
         passengerid   TYPE zc103sdt0012-passengerid,
         passengername TYPE zc103e_sd_passengername,
         souvenir_type TYPE string,
         qty           TYPE zc103sdt0012-qty,
         unit          TYPE zc103sdt0012-unit,
         unit_price    TYPE zc103sdt0012-unit_price,
         Total_price   TYPE zc103sdt0012-Total_price,
         Currency      TYPE zc103sdt0012-Currency,
         style         TYPE lvc_t_styl,
       END OF gs_service,
       gt_service LIKE TABLE OF gs_service.


**********************************************************************
DATA : BEGIN OF gs_tt07v,
         domvalue_l TYPE domvalue_l,
         ddtext     TYPE val_text,
       END OF gs_tt07v,
       gt_tt07v LIKE TABLE OF gs_tt07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.


DATA: gv_top_message TYPE sdydo_text_element VALUE '항공편 스케쥴을 선택하세요.'.

*-- 데이터 파싱 후 ALV에서 실제 display하는  internal table
DATA : BEGIN OF gs_disp_ser,
         status        TYPE icon_d, " ✅ 아이콘용으로 변경!
  status_raw  TYPE zc103sdt0012-status,
         ticketid      TYPE zc103sdt0012-ticketid,
         souvenirid    TYPE zc103sdt0012-souvenirid,
         passengerid   TYPE zc103sdt0012-passengerid,
         passengername TYPE zc103e_sd_passengername,
         souvenir_type TYPE string,
         qty           TYPE zc103sdt0012-qty,
         unit          TYPE zc103sdt0012-unit,
         unit_price    TYPE zc103sdt0012-unit_price,
         total_price   TYPE zc103sdt0012-total_price,
         currency      TYPE zc103sdt0012-currency,
         style         TYPE lvc_t_styl, " ✅ 스타일 필드 추가
       END OF gs_disp_ser,
       gt_disp_ser LIKE TABLE OF gs_disp_ser.


**********************************************************************
**-- 노선테이블 - 가격 계산용
*DATA : gt_price TYPE TABLE OF zc103fit0005,
*       gs_price TYPE zc103fit0005.

*-- 도메인 value 테이블 (Sencondary Key table)
DATA : BEGIN OF gs_dd07v,
         domvalue_l TYPE domvalue_l,
         ddtext     TYPE val_text,
       END OF gs_dd07v,
       gt_dd07v LIKE TABLE OF gs_dd07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.



*-- 데이터 파싱 후 ALV에서 실제 display하는  internal table
DATA : gs_disp_sch LIKE gs_schedule,
       gt_disp_sch LIKE TABLE OF gs_disp_sch,
       BEGIN OF gs_disp_book,
         ticketid      TYPE zc103sdt0012-ticketid,
         souvenirid    TYPE zc103sdt0012-souvenirid,
         passengerid   TYPE zc103sdt0012-passengerid,
         souvenir_type TYPE zc103sdt0012-souvenir_type,
         qty           TYPE zc103sdt0012-qty,
         unit          TYPE zc103sdt0012-unit,
         unit_price    TYPE zc103sdt0012-unit_price,
         Total_price   TYPE zc103sdt0012-Total_price,
         Currency      TYPE zc103sdt0012-Currency,
       END OF gs_disp_book,
       gt_disp_book LIKE TABLE OF gs_disp_book.

**********************************************************************
* Class Instance
**********************************************************************
DATA: go_container      TYPE REF TO cl_gui_docking_container,
      go_split_main     TYPE REF TO cl_gui_splitter_container,
      go_left_cont      TYPE REF TO cl_gui_container,
      go_right_cont     TYPE REF TO cl_gui_container,

      go_split_right    TYPE REF TO cl_gui_splitter_container,
      go_right_top_cont TYPE REF TO cl_gui_container,
      go_right_bot_cont TYPE REF TO cl_gui_container,

      go_grid_sched     TYPE REF TO cl_gui_alv_grid,
      go_grid_booking   TYPE REF TO cl_gui_alv_grid,
      go_grid_detail    TYPE REF TO cl_gui_alv_grid.
*-- TOP OF PAGE 영역용 객체
DATA: go_top_cont    TYPE REF TO cl_gui_docking_container,
      go_html_cntrl  TYPE REF TO cl_gui_html_viewer,
      go_dyndoc_id   TYPE REF TO cl_dd_document.

CLASS lcl_event_handler DEFINITION DEFERRED.
DATA gr_event_handler TYPE REF TO lcl_event_handler.


*-- For ALV
DATA : gt_fcat    TYPE lvc_t_fcat,
       gs_fcat    TYPE lvc_s_fcat,
       gt_tfcat   TYPE lvc_t_fcat,
       gs_tfcat   TYPE lvc_s_fcat,
       gt_bfcat   TYPE lvc_t_fcat,
       gs_bfcat   TYPE lvc_s_fcat,
       gs_layout1 TYPE lvc_s_layo,
       gs_layout2 TYPE lvc_s_layo,
       gs_layout3 TYPE lvc_s_layo,
       gs_variant TYPE disvariant.

*-- User command variable
DATA : gv_okcode              TYPE sy-ucomm,
       gv_selected_scheduleid TYPE zc103e_sd_scheduleid.

TYPES: BEGIN OF ty_detail,
         scheduleid  TYPE zc103sdt0008-scheduleid,
         matid         TYPE zc103mmt0001-matid,
         souvenir_type TYPE string,
         total_qty     TYPE i,
         unit          TYPE zc103mmt0001-base_unit,
         total_price   TYPE p DECIMALS 2,
         currency      TYPE zc103sdt0012-currency,
         unit_price    TYPE p DECIMALS 2,
       END OF ty_detail.

DATA: gt_detail TYPE TABLE OF ty_detail,
      gs_detail TYPE ty_detail.

DATA : gs_item TYPE zc103mmt0008,
       gt_item TYPE table of zc103mmt0008.

DATA: gt_bin_data TYPE STANDARD TABLE OF w3mime,
      lv_bin_size TYPE i,
      lv_file_name TYPE string.

DATA: lt_pdf_raw TYPE STANDARD TABLE OF tline,
      lt_pdf     TYPE solix_tab,
      lv_xstring TYPE xstring,
      lv_spoolid  TYPE rspoid.

DATA: lt_summary  TYPE SORTED TABLE OF ty_detail WITH UNIQUE KEY souvenir_type,
      ls_summary  TYPE ty_detail.

DATA: lv_qty      TYPE i,
      lv_price    TYPE p DECIMALS 2,
      lv_decimals TYPE tcurx-currdec.

TYPES: BEGIN OF ty_price,
         matname    TYPE zc103mmt0001-matname,
         matid      TYPE zc103mmt0001-matid,
         base_unit  TYPE zc103mmt0001-base_unit,
         price      TYPE zc103mmt0001-price,
       END OF ty_price.

DATA: lt_price TYPE TABLE OF ty_price,
      ls_price TYPE ty_price.

DATA : objfile       TYPE REF TO cl_gui_frontend_services,
       pickedfolder  TYPE string,
       initialfolder TYPE string,
       fullinfo      TYPE string,
       pfolder       TYPE rlgrap-filename.

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758

