```abap
*&---------------------------------------------------------------------*
*& Include          ZC103PMR0001TOP
*&---------------------------------------------------------------------*
REPORT zc103sdr0008 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
*TABLES : .

**********************************************************************
* MACRO
**********************************************************************
DEFINE _dock.

  CREATE OBJECT &1
    EXPORTING
      side      = &1->dock_at_left
      extension = 5000.

  CREATE OBJECT &2
    EXPORTING
      i_parent = &1.

END-OF-DEFINITION.
DEFINE _popup_to_confirm.

  CALL FUNCTION 'POPUP_TO_CONFIRM'
    EXPORTING
      text_question         = &1
      text_button_1         = 'Yes'(001)
      text_button_2         = 'No'(002)
      display_cancel_button = 'X'
    IMPORTING
      answer                = &2
    EXCEPTIONS
      text_not_found        = 1
      OTHERS                = 2.

END-OF-DEFINITION.

DEFINE _range.

  &1 = VALUE #( sign    = &2
                option  = &3
                low     = &4
                high    = &5 ).

  APPEND &1.
  CLEAR &1.

END-OF-DEFINITION.

DEFINE _alpha_input.

  CALL FUNCTION 'CONVERSION_EXIT_ALPHA_INPUT'
    EXPORTING
      input  = &1
    IMPORTING
      output = &1.

END-OF-DEFINITION.
**********************************************************************
* Class Instance
**********************************************************************
*-- Sale Plan Instance
DATA : go_item_con TYPE REF TO cl_gui_docking_container,
       go_item_alv TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* TAB Strip Controls
**********************************************************************
*-- TAB Strip object
CONTROLS : gc_tab     TYPE TABSTRIP.
*-- Subscreen number

**********************************************************************
* Internal table and Work area
**********************************************************************
*-- Internal table and Work area
DATA : gt_excel        LIKE TABLE OF alsmex_tabline WITH HEADER LINE.
DATA : BEGIN OF gs_sch,
         scheduleid  TYPE zc103e_sd_scheduleid,
         performdate  TYPE  zc103e_sd_date,
         p_seatsmax  TYPE  zc103sdt0009-p_seatsmax,
         p_seatsocc  TYPE  zc103sdt0009-p_seatsocc,
         e_seatsmax  TYPE  zc103sdt0009-e_seatsmax,
         e_seatsocc  TYPE  zc103sdt0009-e_seatsocc,
         occurate    TYPE zc103sdt0009-occurate,
       END OF gs_sch,
       gt_sch LIKE TABLE OF gs_sch,
       BEGIN OF gs_ooh,
         order_id     TYPE zc103e_pm_order_id,
         aircraft_id  TYPE zc103e_pm_acft_id,
         scheduleid   TYPE zc103e_sd_scheduleid,
         maint_type   TYPE zc103e_pm_maint_type,
         plan_date    TYPE zc103e_pm_plan_date,
         release_date TYPE zc103e_pm_release_date,
         close_date   TYPE zc103e_pm_close_date,
         remarks      TYPE zc103e_text_remarks,
       END OF gs_ooh,
       gt_ooh LIKE TABLE OF gs_ooh,
       BEGIN OF gs_ooi,
         order_id     TYPE  zc103e_pm_order_id,
         operation_id TYPE  zc103e_pm_op_id,
         description  TYPE  zc103e_text_op_desc,
         duration     TYPE  zc103e_pm_duration,
         skill_type   TYPE  zc103e_pm_skill_type,
         remarks      TYPE  zc103e_text_remarks,
       END OF gs_ooi,
       gt_ooi LIKE TABLE OF gs_ooi.

*-- Fieldcatalog table and Structure
DATA : gs_layout       TYPE lvc_s_layo,
       gt_sch_fcat     TYPE lvc_t_fcat,
       gt_ooh_fcat     TYPE lvc_t_fcat,
       gt_ooi_fcat     TYPE lvc_t_fcat,
       gs_cell_tab     TYPE lvc_s_styl,
       gs_variant      TYPE disvariant,
       gs_button       TYPE stb_button,
       gt_ui_functions TYPE ui_functions.

**********************************************************************
* Common variable
**********************************************************************
*-- System feild
DATA : gv_okcode       TYPE sy-ucomm,
       gv_tcode        TYPE sy-tcode,
       gv_file         LIKE rlgrap-filename,
       gv_tabix        TYPE sy-tabix,
       gv_subrc        TYPE sy-subrc,
       gv_dbcnt        TYPE sy-dbcnt,
       gv_str          TYPE string,
       gv_int          TYPE i,
       gv_msg(50),
*-- Dropdown List
       gv_name         TYPE vrm_id,
       gv_list         TYPE vrm_values,
       gv_value        LIKE LINE OF gv_list,
*-- For file path
       w_pickedfolder  TYPE string,
       w_initialfolder TYPE string,
       w_fullinfo      TYPE string,
       w_pfolder       TYPE rlgrap-filename. "MEMORY ID mfolder.

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758

