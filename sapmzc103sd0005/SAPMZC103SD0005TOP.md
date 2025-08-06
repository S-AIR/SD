```abap
*&---------------------------------------------------------------------*
*& Include SAPMZC103SD0005TOP                       - Module Pool      SAPMZC103SD0005
*&---------------------------------------------------------------------*

PROGRAM sapmzc103sd0005 MESSAGE-ID zmsgc103.

*---------------------------------------------------------------------*
* 타입 풀 및 클래스 선언
*---------------------------------------------------------------------*
TYPE-POOLS: cncac, sgec, lvc.
CLASS cl_gui_calendar DEFINITION LOAD.

*---------------------------------------------------------------------*
* 캘린더 이벤트 인스턴스
*---------------------------------------------------------------------*
DATA: myevent     TYPE cntl_simple_event,
      myevent_tab TYPE cntl_simple_events.

*---------------------------------------------------------------------*
* 조건 정보 구조 및 ALV 내부 테이블
*---------------------------------------------------------------------*
DATA: BEGIN OF gs_body.
        INCLUDE STRUCTURE zc103sdt0003.
DATA:   modi_yn TYPE c LENGTH 1,
      END OF gs_body.

DATA: gt_body LIKE TABLE OF gs_body WITH NON-UNIQUE KEY table_line.
DATA: gv_event TYPE zc103sdt0003-conditiontype.

*---------------------------------------------------------------------*
* ALV 객체 및 구성 요소
*---------------------------------------------------------------------*
DATA: go_container    TYPE REF TO cl_gui_custom_container,
      go_split_main   TYPE REF TO cl_gui_splitter_container,
      go_left_cont    TYPE REF TO cl_gui_container,
      go_right_cont   TYPE REF TO cl_gui_container,
      go_left_grid    TYPE REF TO cl_gui_alv_grid,
      go_right_grid   TYPE REF TO cl_gui_alv_grid,
      gt_fcat         TYPE lvc_t_fcat,
      gs_fcat         TYPE lvc_s_fcat,
      gs_layout1      TYPE lvc_s_layo,
      gs_layout2      TYPE lvc_s_layo,
      gs_variant      TYPE disvariant.

*---------------------------------------------------------------------*
* 달력/날짜 관련 변수
*---------------------------------------------------------------------*
DATA: go_fr_con          TYPE REF TO cl_gui_custom_container,
      go_to_con          TYPE REF TO cl_gui_custom_container,
      go_fr_cal          TYPE REF TO cl_gui_calendar,
      go_to_cal          TYPE REF TO cl_gui_calendar,
      gv_fr_date         TYPE sy-datum,
      gv_to_date         TYPE sy-datum,
      gv_calendar_style  TYPE i,
      gv_selection_style TYPE i.

*---------------------------------------------------------------------*
* 선택/입력용 변수
*---------------------------------------------------------------------*
DATA: gv_conid   TYPE zc103sdt0003-conditionid,
      gv_okcode  TYPE sy-ucomm.

*---------------------------------------------------------------------*
* 시계/HTML 컨트롤 관련
*---------------------------------------------------------------------*
DATA: go_clock_con   TYPE REF TO cl_gui_custom_container,
      rf_gui_timer   TYPE REF TO cl_gui_timer,
      gv_clock       TYPE c LENGTH 8,
      go_clock_html  TYPE REF TO cl_gui_html_viewer.

*---------------------------------------------------------------------*
* 날짜 범위 타입 정의
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_cal_range,
         date TYPE cnca_utc_date,
       END OF ty_cal_range.

TYPES: ty_cal_range_tab TYPE STANDARD TABLE OF ty_cal_range WITH DEFAULT KEY.

*---------------------------------------------------------------------*
* 거래처 선택 정보
*---------------------------------------------------------------------*
DATA: gv_selected_bpid   TYPE zc103sdt0003-bpid,
      gv_selected_bpname TYPE zc103sdt0001-bpname.

*---------------------------------------------------------------------*
* 오른쪽 ALV 출력용 테이블
*---------------------------------------------------------------------*
DATA: gt_right_body LIKE TABLE OF gs_body WITH NON-UNIQUE KEY table_line.

*---------------------------------------------------------------------*
* Chart 구성 변수
*---------------------------------------------------------------------*
DATA: go_chart         TYPE REF TO cl_gui_chart_engine,
      go_ixml          TYPE REF TO if_ixml,
      go_ixml_sf       TYPE REF TO if_ixml_stream_factory,
      go_ixml_docu     TYPE REF TO if_ixml_document,
      go_ixml_ostream  TYPE REF TO if_ixml_ostream,
      go_ixml_encoding TYPE REF TO if_ixml_encoding,
      go_chartdata     TYPE REF TO if_ixml_element,
      go_categories    TYPE REF TO if_ixml_element,
      go_category      TYPE REF TO if_ixml_element,
      go_series        TYPE REF TO if_ixml_element,
      go_point         TYPE REF TO if_ixml_element,
      go_value         TYPE REF TO if_ixml_element,
      go_chart_cont    TYPE REF TO cl_gui_custom_container,
      gv_length        TYPE i,
      gv_xstring       TYPE xstring.

*---------------------------------------------------------------------*
* 월별 카운팅 변수
*---------------------------------------------------------------------*
DATA: gv_cnt_ct01 TYPE i VALUE 0,
      gv_cnt_ct02 TYPE i VALUE 0,
      gv_cnt_ct03 TYPE i VALUE 0,
      gv_cnt_ct04 TYPE i VALUE 0,
      gv_cnt_ct05 TYPE i VALUE 0,
      gv_cnt_ct06 TYPE i VALUE 0,
      gv_cnt_ct07 TYPE i VALUE 0,
      gv_cnt_ct08 TYPE i VALUE 0,
      gv_cnt_ct09 TYPE i VALUE 0,
      gv_cnt_ct10 TYPE i VALUE 0,
      gv_cnt_ct11 TYPE i VALUE 0,
      gv_cnt_ct12 TYPE i VALUE 0,
      gv_cnt_ct13 TYPE i VALUE 0,
      gv_cnt_ct14 TYPE i VALUE 0,
      gv_cnt_ct15 TYPE i VALUE 0,
      gv_cnt_ct16 TYPE i VALUE 0,
      gv_cnt_ct17 TYPE i VALUE 0,
      gv_cnt_ct18 TYPE i VALUE 0,
      gv_cnt_ct19 TYPE i VALUE 0,
      gv_cnt_ct20 TYPE i VALUE 0.

*---------------------------------------------------------------------*
* ALV/Tree 컨테이너
*---------------------------------------------------------------------*
DATA: go_main_cont     TYPE REF TO cl_gui_custom_container,
      go_splitter_main TYPE REF TO cl_gui_splitter_container,
      go_splitter_bot  TYPE REF TO cl_gui_splitter_container,
      go_tree_cont     TYPE REF TO cl_gui_docking_container,
      go_alv_cont1     TYPE REF TO cl_gui_docking_container,
      go_alv_cont2     TYPE REF TO cl_gui_docking_container,
      go_alv_cont3     TYPE REF TO cl_gui_docking_container.

*---------------------------------------------------------------------*
* Tree용 거래처 구조
*---------------------------------------------------------------------*
DATA: BEGIN OF gs_tree,
        bpid   TYPE zc103sdt0001-bpid,
        bpname TYPE zc103sdt0001-bpname,
        bptype TYPE zc103sdt0001-bptype,
      END OF gs_tree.

DATA: gt_tree LIKE TABLE OF gs_tree.

*---------------------------------------------------------------------*
* 조건 ALV용 구성
*---------------------------------------------------------------------*
DATA: go_container2 TYPE REF TO cl_gui_custom_container,
      go_alv_grid2  TYPE REF TO cl_gui_alv_grid.

DATA: BEGIN OF gs_dd07v,
        domvalue_l TYPE domvalue_l,
        ddtext     TYPE val_text,
      END OF gs_dd07v.

DATA: gt_dd07v LIKE TABLE OF gs_dd07v
              WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.

DATA: BEGIN OF gs_condition,
        conditionid      TYPE zc103sdt0003-conditionid,
        bpid             TYPE zc103sdt0003-bpid,
        conditiontype    TYPE zc103sdt0003-conditiontype,
        special_discount TYPE string,
        valid_from       TYPE zc103sdt0003-valid_from,
        valid_to         TYPE zc103sdt0003-valid_to,
        discountrate     TYPE zc103sdt0003-discountrate,
        is_cargo_include TYPE string,
        currency         TYPE zc103sdt0003-currency,
        modi_yn(1),
        style            TYPE lvc_t_styl,
      END OF gs_condition.

DATA: gt_condition like TABLE OF gs_condition,
      gs_display   LIKE gs_condition,
      gt_display   LIKE TABLE OF gs_condition.

DATA: gs_disp_sch like gs_condition,
      gt_disp_sch like TABLE OF gs_condition.

DATA: gt_fcat2    TYPE lvc_t_fcat,
      gs_fcat2    TYPE lvc_s_fcat,
      gs_layout02 TYPE lvc_s_layo,
      gs_variant2 TYPE disvariant.

*---------------------------------------------------------------------*
* 사용자 정의 및 화면 전용 변수
*---------------------------------------------------------------------*
DATA: gt_ui_functions TYPE ui_functions,
      gv_editmode     TYPE i,
      gv_search_type  TYPE c LENGTH 5.

*---------------------------------------------------------------------*
* 예약 ALV 관련 구조
*---------------------------------------------------------------------*
DATA: BEGIN OF gs_right_booking,
        bookingid   TYPE zc103sdt0011-bookingid,
        bpid        TYPE zc103sdt0011-bpid,
        custid      TYPE zc103sdt0011-custid,
        conditionid TYPE zc103sdt0011-conditionid,
        flightid    TYPE zc103sdt0011-flightid,
        scheduleid  TYPE zc103sdt0011-scheduleid,
        bookingdate TYPE zc103sdt0011-bookingdate,
        totalticket TYPE zc103sdt0011-totalticket,
        totalprice  TYPE zc103sdt0011-totalprice,
        currency    TYPE zc103sdt0011-currency,
        book_status TYPE zc103sdt0011-book_status,
      END OF gs_right_booking.

DATA: gt_right_booking like TABLE OF gs_right_booking.

DATA: gt_fcat3 TYPE lvc_t_fcat,
      gs_fcat3 TYPE lvc_s_fcat.

*---------------------------------------------------------------------*
* ALV 컬럼 동적 제어용 변수
*---------------------------------------------------------------------*
DATA: hide_cust_flag TYPE abap_bool VALUE abap_false,
      hide_bpid_flag TYPE abap_bool VALUE abap_false,
      gv_first_entry TYPE abap_bool VALUE abap_true.

*---------------------------------------------------------------------*
* 예약 정보 표시용 타입
*---------------------------------------------------------------------*
TYPES: BEGIN OF ty_book_disp,
         bookingid     TYPE zc103sdt0011-bookingid,
         bpid          TYPE zc103sdt0011-bpid,
         bpname        TYPE zc103sdt0001-bpname,
         custid        TYPE zc103sdt0011-custid,
         custname      TYPE zc103sdt0002-name,
         conditionid   TYPE zc103sdt0011-conditionid,
         conditiontype TYPE zc103sdt0003-conditiontype,
         flightid      TYPE zc103sdt0011-flightid,
         scheduleid    TYPE zc103sdt0011-scheduleid,
         bookingdate   TYPE zc103sdt0011-bookingdate,
         totalticket   TYPE zc103sdt0011-totalticket,
         totalprice    TYPE zc103sdt0011-totalprice,
         currency      TYPE zc103sdt0011-currency,
         book_status   TYPE string,
       END OF ty_book_disp.


DATA: gt_disp TYPE TABLE OF ty_book_disp.
