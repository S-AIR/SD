<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">
<html>
<head>
<title>SAPMZC103SD0004</title>
</head>
<body bgcolor="#FFFFE0">
<font size="3" face = "Arial" color="#000000"><b>Code listing for: SAPMZC103SD0004</b></font>
<br>
<font size="3" face = "Arial" color="#000000"><b>Description:  [SD] 항공권 관리 프로그램</b></font>
<hr>
<pre width="100">
<font color ="#0000FF">*&---------------------------------------------------------------------*</font>
<font color ="#0000FF">*& Module Pool      SAPMZC103SD0004</font>
<font color ="#0000FF">*&---------------------------------------------------------------------*</font>
<font color ="#0000FF">*&</font>
<font color ="#0000FF">*&---------------------------------------------------------------------*</font>

INCLUDE sapmzc103sd0004top                      .  " Global Data
INCLUDE sapmzc103sd0004c01                      .  " Selection screen
INCLUDE sapmzc103sd0004o01                      .  " PBO-Modules
INCLUDE sapmzc103sd0004i01                      .  " PAI-Modules
INCLUDE sapmzc103sd0004f01                      .  " FORM-Routines

<font color ="#0000FF">*GUI Texts</font>
<font color ="#0000FF">*----------------------------------------------------------</font>
<font color ="#0000FF">* TITLE100 --&gt; [SD] 항공권 관리 페이지</font>
<font color ="#0000FF">* TITLE110 --&gt; 항공권 상세 내역</font>
<font color ="#0000FF">* TITLE120 --&gt; 기내 유료상품 조회</font>
<font color ="#0000FF">* TITLE130 --&gt; 항공권 생성</font>


<font color ="#0000FF">*Messages</font>
<font color ="#0000FF">*----------------------------------------------------------</font>
<font color ="#0000FF">*</font>
<font color ="#0000FF">* Message class: Hard coded</font>
<font color ="#0000FF">*   잘못된 날짜 입력</font>
<font color ="#0000FF">*</font>
<font color ="#0000FF">* Message class: ZMSGC103</font>
<font color ="#0000FF">*000   &</font>
<font color ="#0000FF">*001   & &</font>
<font color ="#0000FF">*003   조회되는 데이터가 없습니다.</font>
<font color ="#0000FF">*008   &건을 조회했습니다.</font>
<font color ="#0000FF">*022   데이터 저장이 완료되었습니다.</font>
<font color ="#0000FF">*023   데이터 저장이 완료되지 않았습니다.</font>
<font color ="#0000FF">*027   변경사항이 없습니다.</font>
</pre>
<hr>
<font size="2" face = "Sans Serif">Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
</font>
</body>
</html>
